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

class advDayReport {
    /**
     * 描述 : 构造初始化
     * 作者 : LiuYun
     */
    constructor() {
        this.findNewUrl = true;
        this.onDataFrameReady = this.saveData;
    }

    id = 'advDayReport';
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
        return !!url && !!url.match(/(http:\/\/advertising.amazon.com)?\/(.*)/);
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
        let readData = WebSqlObj.read('yafex','where currentPage = "true"');
        readData.then((getDate)=>{
            if (getDate && getDate.length != 0) {
                var beforeDay = getDate[0].name.split('_')[1];
                var obj = new Date();
                var thisObj = new Date(obj.getTime() - beforeDay*24*60*60*1000);
                var moonList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                var moon = thisObj.getMonth();
                var dayStr = moonList[moon] + " " + thisObj.getDate() + ", " + thisObj.getFullYear();
                $("#cards-container > div.sc-pReKu.eehIqb > div > div.sc-pRFjI.kqMATi > table > tbody > tr:nth-child(2) > td > label > button").click();
                setTimeout(function(){
                    $('#portal > div > div > button:nth-child(3)').click();
                    $("#cards-container > div.sc-pReKu.eehIqb > div > div.sc-pRFjI.kqMATi > table > tbody > tr:nth-child(4) > td > button").click();
                    setTimeout(function(){
                        var tdEq = '';
                        $(".CalendarDay").each(function(i) {
                            var ariaLabel = $(this).attr("aria-label");
                            if (ariaLabel.indexOf(dayStr) != -1) {
                                tdEq = i;
                            }
                        });
                        if (tdEq !== '') {
                            $(".CalendarDay").eq(tdEq).click();
                            $("#portal > div > div > div > div.sc-pBolk.kPdszo > div.sc-pkhIR.jBEtKx > button.sc-AxirZ.qAlDi").click();
                        }
                    },1000)
                },1000);
                let linkA = [
                    {
                        "name": 'runAdvDayReport_' + beforeDay,
                        "url": "domClick",
                        "purl": getDate[0].url,
                        "level": '2',
                        "status": '0',
                        "errStatus": '0',
                        "currentPage": 'false'
                    }
                ];
                WebSqlObj.add("yafex", linkA).then((data)=>{
                    console.log(data);
                });
            }
        })
    };
}

module.exports = advDayReport;