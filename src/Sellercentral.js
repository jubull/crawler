const DataFrame = dfjs.DataFrame;
const {
    createUrlGetter,
} = require('./helper');
const log = require('./logger');
const anchorFilter = (ele) => {
    /** 暂停状态，不抓取 */
    return $(ele).closest('tr').find('span.status-0').length <= 0;
};
const newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

class Sellercentral {
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
        return !!url && !!url.match(/(http:\/\/sellercentral.amazon.com\/gp\/homepage.html)?\/(.*)/);
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
        let linkA = [];
        let adReports = {};
        $("#sc-navtab-reports > ul > li").each(function(i,v){
            let rows = {
                "name": '',
                "url":'',
                "purl": window.location.href,
                "level": '1',
                "status": '0',
                "errStatus": '0',
                "currentPage": 'false'
            }
            rows.name = $(this).find('a').html().trim().replace(' ','');
            rows.url = $(this).find('a').attr('href');
            if(rows.name == 'AdvertisingReports'){
                adReports = rows;
            }
        })
        const dateObj = new Date();
        var today = dateObj.getMonth() + '-' + dateObj.getDate();
        //添加1、7天business报表下载 需编辑链接
        const endObj = new Date(dateObj.getTime() - 2*24*60*60*1000);
        const startObj = new Date(dateObj.getTime() - 8*24*60*60*1000);
        var startMoon = startObj.getMonth() + 1;
        if (startMoon >= 1 && startMoon <= 9) {
            startMoon = "0" + startMoon;
        }
        var endMoon = endObj.getMonth() + 1;
        if (endMoon >= 1 && endMoon <= 9) {
            endMoon = "0" + endMoon;
        }
        var startDay = startObj.getDate();
        if (startDay >= 1 && startDay <= 9) {
            startDay = "0" + startDay;
        }
        var endDay = endObj.getDate();
        if (endDay >= 1 && endDay <= 9) {
            endDay = "0" + endDay;
        }
        const startTime = startMoon + '/' + startDay + '/' + startObj.getFullYear();
        const endTime = endMoon + '/' + endDay + '/' + endObj.getFullYear();
        /*1天*/
        var oneBusinessDay = localStorage.getItem("oneBusinessDay");
        if (oneBusinessDay != today) {
            let oneBusinessUrl = "https://sellercentral.amazon.com/gp/site-metrics/report.html#&cols=/c0/c1/c2/c3/c4/c5/c6/c7/c8/c9/c10/c11&sortColumn=12&filterFromDate=" + endTime + "&filterToDate=" + endTime + "&fromDate=" + endTime + "&toDate=" + endTime + "&reportID=102:DetailSalesTrafficByChildItem&sortIsAscending=0&currentPage=0&dateUnit=1&viewDateUnits=ALL&runDate=";
            let oneBusinessRows = {
                "name": 'BusinessReports',
                "url": oneBusinessUrl,
                "purl": window.location.href,
                "level": '1',
                "status": '0',
                "errStatus": '0',
                "currentPage": 'false'
            };
            linkA.push(oneBusinessRows);
        }
        /*7天*/
        var sevenBusinessDay = localStorage.getItem("sevenBusinessDay");
        if (sevenBusinessDay != today) {
            let sevenBusinessUrl = "https://sellercentral.amazon.com/gp/site-metrics/report.html#&cols=/c0/c1/c2/c3/c4/c5/c6/c7/c8/c9/c10/c11&sortColumn=12&filterFromDate=" + startTime + "&filterToDate=" + endTime + "&fromDate=" + startTime + "&toDate=" + endTime + "&reportID=102:DetailSalesTrafficByChildItem&sortIsAscending=0&currentPage=0&dateUnit=1&viewDateUnits=ALL&runDate=";
            let sevenBusinessRows = {
                "name": 'BusinessReportsPages',
                "url": sevenBusinessUrl,
                "purl": window.location.href,
                "level": '1',
                "status": '0',
                "errStatus": '0',
                "currentPage": 'false'
            };
            linkA.push(sevenBusinessRows);
        }
        linkA.push(adReports);
        WebSqlObj.add("yafex", linkA).then((data)=>{
            console.log(data);
        });
    };
}

module.exports = Sellercentral;