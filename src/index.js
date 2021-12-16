'use strict';

const log = require('./logger');
const {Crawler} = require('./crawler');
const {delayDo} = require('./retry');
const crawlerSaver = require('./crawlerSaver');
const WebSql = require('./WebSql');
const WebSqlObj = new WebSql();

/**
 * 描述 : 初始化配置界面
 * 作者 : LiuYun
 */
function initConfigPannel() {
    GM_config.init(
        {
            'id': 'Taobao_Crawler_Config',
            'fields':
                {
                    hidden1: {
                        section: ['操作等待时间', '每加载一个网页后，等待一些时间，防止访问过快而被亚马逊官方察觉.'],
                        type: 'hidden',
                    },
                    'minWait':
                        {
                            'label': '最少等待时间（秒）',
                            'type': 'int',
                            'default': '3'
                        },
                    'maxWait':
                        {
                            'label': '最长等待时间（秒）',
                            'type': 'int',
                            'default': '5'
                        },
                    hidden2: {
                        'section': ['定时器配置', '配置方法请参考这里：<a href="https://bunkat.github.io/later/parsers.html#text" target=”_blank”>配置帮助</a>'],
                        type: 'hidden',
                    },
                    'scrawlScheduleText':
                        {
                            'label': '抓取定时器配置',
                            'type': 'text',
                            'default': 'at 23:50 also every 1 hour between 1 and 23'
                        },
                    'downloadScheduleText':
                        {
                            'label': '下载定时器配置',
                            'type': 'text',
                            'default': 'at 23:58',
                        },
                    hidden3: {
                        'section': ['亚马逊店铺账户配置', '当登陆状态实效时，需要重新登陆。'],
                        type: 'hidden',
                    },
                    'taobaoAccount':
                        {
                            'label': '亚马逊店铺账户',
                            'type': 'text',
                            'default': ''
                        },
                    'taobaoPWD':
                        {
                            'label': '亚马逊店铺密码',
                            'type': 'text',
                            'default': ''
                        },
                    hidden4: {
                        'section': ['文件下载根目录', '当前浏览器下载文件地址'],
                        type: 'hidden',
                    },
                    'downloadUrl':
                        {
                            'label': '文件下载根目录',
                            'type': 'text',
                            'default': ''
                        },
                    'accountCode':
                        {
                            'label': '账号简称',
                            'type': 'text',
                            'default': ''
                        },
                }
        });
}

/**
 * 描述 : 登录选项
 * 参数 :
 *       $params : {
 *          "spu" : 商品spu
 *          "shopName" : 店铺名称
 *          "siteCode" : 站点
 *       }
 * 返回 :
 *       {
 *          "code" : 正常 200,异常401
 *          "info" : 正常、异常信息
 *          "data" : []
 *       }
 * 注明 :
 * 作者 : LiuYun
 */
const loginOptions = {
    loginPageURL: 'https://sellercentral.amazon.com/ap/signin?clientContext=135-8408180-7833347&openid.return_to=https%3A%2F%2Fsellercentral.amazon.com%2Fhome&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=sc_na_amazon_v2&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&ssoResponse=eyJ6aXAiOiJERUYiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiQTI1NktXIn0.AQP0A_YVXfJe489bTT7q7jR8_MOp--1fYF1g_6lQpeQ_dkvkoTKLPA.yHkRdl69ZGi5zPri.B645pEJ4Bcpm23X42QJUBxB_yqRnJCozHp2BqknS_i6j7T_whOEoJyGfTKHV7gNjMeNjh5IeHYV-V7cXJuv6mIq4afuCpqAgPTfBL0bRFsvQDlt54AdHpQJYZKIjnWdoxpsmdeaXsGTrXMCuw2mSQEuAL0KVhPFi9uVfCu32o92xCD4eoWvjKPqf2ccrKbqK0VaFud-bXyE2rf2_O2VcZf2owfmkXcCH8a7vHeNvnUFqp9s12FOYLgNbJ9-KTH8MXxwU6q7-M5Ulk7j73Vqo6Vpcy7AN5YtVCAXD.559IpeKQ1ospZwoNhgjJoQ',
    needLogin: () => {
        const mainWindow = $('#authportal-main-section > div:nth-child(2) > div > div > form').length > 0;
        const singIn = $('#authportal-main-section > div:nth-child(2) > div > div > div > div > div.a-section.auth-prompt-section > div').length > 0;
        return mainWindow || singIn;
    },

    isLoginPageReady: () => true,
    isLoginSuccess: () => {
        return $('#J_LoginBox .bd').css('display') === 'none';
    },
    doLogin: async () => {
        await delayDo(() => {
            const account = GM_config.get('taobaoAccount');
            $('#ap_email').val(account);
        }, 1000);
        await delayDo(() => {
            const pwd = GM_config.get('taobaoPWD');
            $('#ap_password').val(pwd);
        }, 1000);
        await delayDo(() => {
            log.debug('doLogin. submit');
            $('#signInSubmit').click();
        }, 2000);
    }
};

/**
 * 描述 : 创建爬虫选项
 * 返回 :
 *       {
 *          "startPageURL" : "打开页面地址URL",
 *          "minWait" : "最少等待时间",
 *          "maxWait" : "最多等待时间",
 *          "gotoUrl" : "打开地址URL",
 *          "pageList" : {
 *              "需要爬取的页面对象"，
 *          },
 *          "login" : "登录选择",
 *          "onPageStart" : "监听开始爬取",
 *          "onCrawlComplete" : "监听爬取完成"
 *       }
 * 注明 :
 * 作者 : LiuYun
 */
function createCrawlerOptions(intoPageJs) {
    let intoPageJsPage = '';
    switch(intoPageJs){
        case "./Sellercentral.js":
            intoPageJsPage = require('./Sellercentral.js');
        break;
        case "./BusinessReports.js":
            intoPageJsPage = require('./BusinessReports.js');
        break;
        case "./AdvertisingReports.js":
            intoPageJsPage = require('./AdvertisingReports.js');
        break;
        case "./NewReport1.js":
            intoPageJsPage = require('./NewReport1.js');
        break;
        case "./advDayReport.js":
            intoPageJsPage = require('./advDayReport.js');
        break;
        case "./NewReport3.js":
            intoPageJsPage = require('./NewReport3.js');
        break;
        case "./RunReport1.js":
            intoPageJsPage = require('./RunReport1.js');
        break;
        case "./runAdvDayReport.js":
            intoPageJsPage = require('./runAdvDayReport.js');
        break;
        case "./RunReport3.js":
            intoPageJsPage = require('./RunReport3.js');
        break;
        case "./BusinessReportsPages.js":
            intoPageJsPage = require('./BusinessReportsPages.js');
        break;
        case "./CampaignsList.js":
            intoPageJsPage = require('./CampaignsList.js');
        break;
    }
    const options = {
        startPageURL: 'https://sellercentral.amazon.com/home',
        minWait: (GM_config.get('minWait') || 3) * 1000,
        maxWait: (GM_config.get('maxWait') || 5) * 1000,
        gotoUrl: async (url) => {
            location.href = url
        },
        pageList: [
            new intoPageJsPage()
        ],
        login: loginOptions,
        onPageStart: () => {
            crawlerSaver.saveCrawler(currRunningCrawler);
        },
        onCrawlComplete: () => {
            crawlerSaver.clearCrawler();
        }
    };
    return options;
}

/**
 * 描述 : 创建页面爬虫步骤
 * 作者 : LiuYun
 */
function createOnePageCrawler(intoPageJs) {
    const options = createCrawlerOptions(intoPageJs);
    const {pageList} = options;
    const url = window.location.href;
    const newPageList = pageList.filter(p => p.triggerOnUrl(url));
    console.log(newPageList);
    newPageList.forEach(p => {
        p.findNewUrl = false;
        p.onDataFrameReady = async (fileName, newFileName, dataFrame) => {
            if (dataFrame instanceof Object) {
                const workbook = XLSX.utils.book_new();
                const data = dataFrame.toCollection();
                const option = undefined;
                const sheet = XLSX.utils.json_to_sheet(data, option);
                XLSX.utils.book_append_sheet(workbook, sheet, p.id);
                XLSX.writeFile(workbook, fileName);
            }
            if (typeof(fileName) === 'string' && fileName !== '') {
                options.fileName = fileName;
            }
            if (typeof(newFileName) === 'string' && newFileName !== '') {
                options.newFileName = newFileName;
            }
        }
    });
    options.pageList = newPageList;
    options.startPageURL = url;
    options.onPageStart = () => {

    };
    options.onCrawlComplete = () => {
         if (options.fileName) {
            const pathName = GM_config.get('downloadUrl') + "/" + options.fileName;
            sendFileNow(pathName, options.newFileName);
        }
        //读取数据
        let readData = WebSqlObj.read('yafex','');
        readData.then((getDate)=>{
            //通过读取的数据得到当前页面链接
            let readUrl = '';
            if(getDate && getDate.length == 1){
                readUrl = getDate[0];
            }else{
                getDate.forEach((d)=>{
                    if(d.currentPage == 'true'){
                        readUrl = d;
                    }
                })
            }
            if(!readUrl.name){
                return false;
            }
            //通过当前页面链接更改当前数据状态
            console.log("false====="+readUrl.name);
            let updateDate = WebSqlObj.update('yafex', 'name', readUrl.name,{'status':'1','currentPage':'false'});
            updateDate.then(()=>{
                //向字节点查找数据
                let result = WebSqlObj.getChildUrlByPurl("yafex",readUrl.url);

                result.then((data)=>{
                    let newdata = [];
                    if(data && data.length != 0) {
                        data.forEach(function(v,i) {
                            if(v.status == 0) {
                                newdata.push(v);
                            }
                        })
                        if(newdata && newdata.length != 0){
                            console.log("true====="+newdata[0].name);
                            let updateCurrentPage = WebSqlObj.update('yafex', 'name', newdata[0].name,{'currentPage':'true'});
                            updateCurrentPage.then(()=>{
                                let localObj = WebSqlObj.read('yafex','');
                                localObj.then((localData)=>{
                                    if(newdata[0].url == 'domClick'){
                                        $('#J_Button_NORMAL_ENABLED').click();
                                        setTimeout(function(){
                                            crawlCurrPage();
                                        },11000)
                                    }else{
                                        let tempwindow=window.open();
                                        tempwindow.location=newdata[0].url;
                                        setTimeout(function(){
                                            window.pener = null;
                                            window.open("about:blank", "_self");
                                            window.close();
                                        },11000)
                                    }
                                })
                            })
                        }
                    }else{
                        let resultUrl = WebSqlObj.getPrentUrlByUrl("yafex",readUrl.purl);
                        resultUrl.then((dataUrl)=>{
                            let resultUrlNew = [];
                            dataUrl.forEach(function(v,i) {
                                if(v.status == 0) {
                                    resultUrlNew.push(v);
                                }
                            })
                            if(resultUrlNew && resultUrlNew.length != 0){
                                console.log("true====="+resultUrlNew[0].name);
                                let updateCurrentPage = WebSqlObj.update('yafex', 'name', resultUrlNew[0].name,{'currentPage':'true'});
                                updateCurrentPage.then(()=>{
                                    let localObj = WebSqlObj.read('yafex','');
                                    localObj.then((localData)=>{
                                        if(resultUrlNew[0].url == 'domClick'){
                                            $('#J_Button_NORMAL_ENABLED').click();
                                            setTimeout(function(){
                                                crawlCurrPage();
                                            },11000)
                                        }else{
                                            let tempwindow=window.open();
                                            tempwindow.location=resultUrlNew[0].url;
                                            setTimeout(function(){
                                                window.pener = null;
                                                window.open("about:blank", "_self");
                                                window.close();
                                            },11000)
                                        }
                                    })
                                })
                            }else{
                                WebSqlObj.read('yafex', 'where level="0"').then((dataLevel)=>{
                                    if(dataLevel && dataLevel.length !=0){
                                        let resultLevel = WebSqlObj.getChildUrlByPurl("yafex",dataLevel[0].url);
                                        let levelNew = [];
                                        resultLevel.then((leveldata)=>{
                                            leveldata.forEach(function(v,i) {
                                                if(v.status == '0') {
                                                    levelNew.push(v);
                                                }
                                            })
                                            if(levelNew && levelNew.length !=0){
                                                console.log("true====="+levelNew[0].name);
                                                //兼容老页面数据完整
                                                if (levelNew[0].name === 'AdvertisingReports' && levelNew[0].level == '1') {
                                                    var levelCurrentPage = WebSqlObj.update('yafex', 'name', levelNew[0].name, {'status':'1'});
                                                } else {
                                                    var levelCurrentPage = WebSqlObj.update('yafex', 'name', levelNew[0].name, {'currentPage':'true'});
                                                }
                                                levelCurrentPage.then(()=>{
                                                    let localObj = WebSqlObj.read('yafex','');
                                                    localObj.then((localData)=>{
                                                        if(levelNew[0].url == 'domClick'){
                                                            $('#J_Button_NORMAL_ENABLED').click();
                                                            setTimeout(function(){
                                                                crawlCurrPage();
                                                            },11000)
                                                        }else{
                                                            let tempwindow=window.open();
                                                            tempwindow.location=levelNew[0].url;
                                                            setTimeout(function(){
                                                                window.pener = null;
                                                                window.open("about:blank", "_self");
                                                                window.close();
                                                            },11000)
                                                        }
                                                    })
                                                })
                                            }else{
                                                console.log('daodile' + '测试失败了');
                                            }
                                        })
                                        
                                    }
                                    
                                })
                            }
                        }) 
                    }
                })
            })
        })
    };
    return new Crawler(options);
}


/**
 * 描述 : 初始化页面爬虫
 * 作者 : LiuYun
 */
function crawlCurrPage() {
    let adUrl = window.location.href.split('?')[0];
    //描述 : 如是首页或 advertising.amazon.com 域，则将websql数据清空
    if(window.location.href == 'https://sellercentral.amazon.com/home?ref_=xx_swlang_head_xx&mons_sel_locale=en_US&languageSwitched=1' 
        || window.location.href == 'https://sellercentral.amazon.com/home?ref_=xx_swlang_head_xx&mons_sel_locale=en_US&languageSwitched=1&' 
        || adUrl == 'https://advertising.amazon.com/sspa/tresah/ref=xx_perftime_dnav_xx'){
        const delTable = WebSqlObj.delTable("yafex");
    }
    //索评页面不加载
    if (adUrl == 'https://sellercentral.amazon.com/messaging/reviews') {
        console.log('索评页面不加载');
        return false;
    }
    //交易报表页面不加载
    if (adUrl == 'https://sellercentral.amazon.com/payments/reports/custom/request') {
        console.log('交易报表页面不加载');
        return false;
    }
    //重置页面不需要刷新
    localStorage.setItem("refreshFlag", 'no');
    localStorage.setItem("refreshNum", 0);
    //描述 : 获取websql数据
    const resultRead = WebSqlObj.read("yafex", "");
    resultRead.then((resultData)=>{
        if(!resultData || resultData.length == 0){
            let row = [{
                "name": 'Sellercentral',
                "url": window.location.href,
                "purl": '',
                "level": '0',
                "status": '0',
                "errStatus": '0',
                "currentPage":'true'
            }];

            if(adUrl == 'https://advertising.amazon.com/sspa/tresah/ref=xx_perftime_dnav_xx'){
                row[0].name = 'AdvertisingReports'
            }
            const result = WebSqlObj.add("yafex", row);
            result.then((data)=>{
                if(data){
                    const intoPageJs = './'+ row['0'].name +'.js';
                    const crawler = createOnePageCrawler(intoPageJs);
                    crawler.start();
                }
            })
        }else{
            resultData.forEach((data) => {
                if(data.currentPage == 'true'){
                    const intoPageJs = './'+ data.name.split('_')[0] +'.js';
                    console.log(intoPageJs)
                    const crawler = createOnePageCrawler(intoPageJs);
                    crawler.start();
                }
            })
        }
    })
}

/**
 * 描述 : 发送本地网络请求
 * 作者 : Y.X.chen
 */
function sendFileNow(file = '', newFile = '') {
    const newFileType = (typeof(newFile) === 'string' && newFile !== '') ? "&newfile=" + newFile : '';
    //延迟5秒通知上传
    setTimeout(function () {
        GM_xmlhttpRequest({
            method: "POST",
            url: "http://127.0.0.1:9001/upload/?path=" + file + newFileType,
            onload: function (res) {
                if (res.status === 200) {
                    log.debug('_dow: dowSuccess:', res.statusText);
                    //设置上传文件成功缓存
                    var dateObj = new Date();
                    var today = dateObj.getMonth() + '-' + dateObj.getDate();
                    if (newFile.split('_')[0] === 'BusinessReport') {
                        localStorage.setItem("oneBusinessDay", today);
                    }
                    if (newFile.split('_')[0] === 'businessReports') {
                        localStorage.setItem("sevenBusinessDay", today);
                    }
                    if (newFile.split('_')[0] === 'advSearchTermReport') {
                        localStorage.setItem("oneTermDay", today);
                    }
                    if (newFile.split('_')[0] === 'advProductReport') {
                        var needAdvDay = [];
                        for(var i = 8; i >= 2; i--) {
                            var timeObj = new Date(dateObj.getTime() - i*24*60*60*1000);
                            var timeMoon = timeObj.getMonth() + 1;
                            var timeDay = timeObj.getDate();
                            needAdvDay.push(timeMoon + '-' + timeDay);
                        }
                        var advDayReportList = localStorage.getItem("oneAdvDay");
                        var advDayReportArr = [];
                        if (advDayReportList) {
                            advDayReportArr = advDayReportList.split(",");
                        }
                        var oneAdvDayList = [];
                        $.each(advDayReportArr, function(k, v){
                            if (needAdvDay.includes(v)) {
                                oneAdvDayList.push(v);
                            }
                        });
                        var dayEq = newFile.split('_')[3];
                        if (dayEq) {
                            var timeObj = new Date(dateObj.getTime() - dayEq*24*60*60*1000);
                            var addDate = (timeObj.getMonth() + 1) + "-" + timeObj.getDate();
                            oneAdvDayList.push(addDate);
                        }
                        if (oneAdvDayList.length) {
                            var oneAdvDayStr = oneAdvDayList.join(",");
                            localStorage.setItem("oneAdvDay", oneAdvDayStr);
                        }
                    }
                    if (newFile.split('_')[0] === 'advertisingReports') {
                        localStorage.setItem("sevenAdvDay", today);
                    }
                    if (newFile.split('_')[0] === 'campaigns') {
                        localStorage.setItem("campaignsDay", today);
                    }
                }
                console.log(res);
            }
        });
    }, 5000);
}

/**
 * 描述 : 配置界面
 * 作者 : LiuYun
 */
const GMMenus = [
    {
        name: '仅抓取此页',
        fn: crawlCurrPage,
        accessKey: 'curr'
    },
    {
        name: '爬虫配置',
        fn: () => GM_config.open(),
        accessKey: 'config'
    },
];
/**
 * 描述 : 配置界面
 * 作者 : LiuYun
 */
GMMenus.forEach(m => {
    GM_registerMenuCommand(m.name, m.fn, m.accessKey);
});

/**
 * 临时运行调度器
 */
let currRunningCrawler = null;
/**
 * 描述 : 监听当前窗口页面加载完毕之后执行一下事件
 * 注明 : 首先初始化配置页面
 * 作者 : LiuYun
 */
window.onload = async () => {
    initConfigPannel();
    later.date.localTime();
    if (window.top == window.self) {
        //判断是否需要登录
        if (loginOptions.needLogin()) {
            log.debug(`login`);
            loginOptions.doLogin();
        } else {
            log.debug(`nologin`);
        }
        setTimeout(function () {
            //控制adv报表英文模式下载
            if (location.href == 'https://advertising.amazon.com/cm/campaigns?languageSwitched=1&mons_sel_locale=en_US&ref_=xx_swlang_head_xx' &&
                $("input[name=aac-select-language]:checked").val() != 'en_US') {
                console.log('into');
                // $("#aac-select-language-en_US").click();
                var e = document.createEvent('MouseEvents');
                e.initEvent("click", true, true);
                document.getElementById("aac-select-language-en_US").dispatchEvent(e);
            }
            //调用初始化页面规则
            crawlCurrPage();
        }, 5000);
    }
};