const DataFrame = dfjs.DataFrame;
const {
    createUrlGetter,
    extractDevColumns,
    extractDevData,
    transformObject,
} = require('./helper');
const log = require('./logger');
const anchorFilter = (ele) => {
    /** 暂停状态，不抓取 */
    return $(ele).closest('tr').find('span.status-0').length <= 0;
};
const newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

class AdvertisingReports {
    /**
     * 描述 : 构造初始化
     * 作者 : LiuYun
     */
    constructor() {
        this.findNewUrl = true;
        this.onDataFrameReady = this.saveData;
    }

    id = 'campaigns';
    /**
     * 描述 : 监听页面
     * 作者 : LiuYun
     */
    onPageReady = async (fetchSN) => {
        const dataFrame = this.parseData(fetchSN);
        await this.onDataFrameReady(dataFrame);
    };
    /**
     * 描述 : 连接
     * 作者 : LiuYun
     */
    triggerOnUrl = (url) => {
        return !!url && !!url.match(/(http:\/\/advertising.amazon.com\/sspa\/tresah)?\/(.*)/);
    };
    /**
     * 描述 : 获取连接添加到队列中
     * 作者 : LiuYun
     */
    getUrlsToAdd = () => {
        return this.findNewUrl ? newUrlsGetter() : [];
    };
    /**
     * 描述 : 页面是否读取
     * 作者 : LiuYun
     */
    isPageReady = () => {
        const ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
        log.debug('isPageReady:', ret);
        return ret;
    };
    /**
     * 描述 : 保存数据
     * 参数 :
     *       dataFrame : 数据框
     * 作者 : LiuYun
     */
    saveData = async (dataFrame) => {
        const {db} = require('./db');
        await db['campaigns_log'].bulkPut(dataFrame.toCollection());
        await db['headers'].put({table_name: 'campaigns_log', 'columns': dataFrame.listColumns()});
    };
    /**
     * 描述 : 根据页面解析数据
     * 参数 :
     *       fetchSN : 标识
     * 返回 :
     *       返回数据框格式
     * 作者 : LiuYun
     */
    parseData = (fetchSN) => {
        const WebSql = require('./WebSql.js');
        const WebSqlObj = new WebSql();
        var continueFlag = $("#advertising-reports > div > div > div > div.sc-fzonZV.fjLydT > div > a").attr("href");
        //新版本广告页面才生成
        if (!!continueFlag) {
            let linkA = [];
            var addFlag = false;
            const dateObj = new Date();
            var today = dateObj.getMonth() + '-' + dateObj.getDate();
            //Term报表下载
            var oneTermDay = localStorage.getItem("oneTermDay");
            if (oneTermDay != today) {
                let oneTermRows = {
                    "name": 'NewReport1',
                    "url": $("#advertising-reports > div > div > div > div.sc-fzonZV.fjLydT > div > a").attr("href"),
                    "purl": window.location.href,
                    "level": '1',
                    "status": '0',
                    "errStatus": '0',
                    "currentPage": 'false'
                };
                linkA.push(oneTermRows);
                addFlag = true;
            }
            //1天adv报表下载,下载连续最近七天
            var needAdvDay = [];
            for(var i = 8; i >= 2; i--) {
                var timeObj = new Date(dateObj.getTime() - i*24*60*60*1000);
                var timeMoon = timeObj.getMonth() + 1;
                needAdvDay.push(timeMoon + '-' + timeObj.getDate());
            }
            var advDayReportList = localStorage.getItem("oneAdvDay");
            var advDayReportArr = [];
            if (advDayReportList) {
                advDayReportArr = advDayReportList.split(",");
            }
            $.each(needAdvDay, function(k, v){
                if (!advDayReportArr.includes(v)) {
                    var nameFix = 8 - k;
                    var oneAdvRows = {
                        "name": 'advDayReport_' + nameFix,
                        "url": $("#advertising-reports > div > div > div > div.sc-fzonZV.fjLydT > div > a").attr("href"),
                        "purl": window.location.href,
                        "level": '1',
                        "status": '0',
                        "errStatus": '0',
                        "currentPage": 'false'  
                    };
                    linkA.push(oneAdvRows);
                    addFlag = true;
                }
            });
            //7天adv报表下载
            var sevenAdvDay = localStorage.getItem("sevenAdvDay");
            if (sevenAdvDay != today) {
                let sevenAdvRows = {
                    "name": 'NewReport3',
                    "url": $("#advertising-reports > div > div > div > div.sc-fzonZV.fjLydT > div > a").attr("href"),
                    "purl": window.location.href,
                    "level": '1',
                    "status": '0',
                    "errStatus": '0',
                    "currentPage": 'false'  
                };
                linkA.push(sevenAdvRows);
                addFlag = true;
            }
            //广告组列表下载
            var campaignsDay = localStorage.getItem("campaignsDay");
            if (campaignsDay != today) {
                let campaignsRows = {
                    "name": 'CampaignsList',
                    "url": "https://advertising.amazon.com/cm/campaigns",
                    "purl": window.location.href,
                    "level": '1',
                    "status": '0',
                    "errStatus": '0',
                    "currentPage": 'false'  
                };
                linkA.push(campaignsRows);
                addFlag = true;
            }
            if (addFlag) {
                WebSqlObj.add("yafex", linkA).then((data)=>{
                    console.log(data);
                });
            }
        }
    };
}

module.exports = AdvertisingReports;