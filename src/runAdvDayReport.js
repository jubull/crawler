const DataFrame = dfjs.DataFrame;
const {
    createUrlGetter,
    matchSiteCodeNew
} = require('./helper');
const log = require('./logger');
const anchorFilter = (ele) => {
    /** 暂停状态，不抓取 */
    return $(ele).closest('tr').find('span.status-0').length <= 0;
};
const newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

class runAdvDayReport {
    /**
     * 描述 : 构造初始化
     * 作者 : LiuYun
     */
    constructor() {
        this.findNewUrl = true;
        this.onDataFrameReady = this.saveData;
    }

    id = 'runAdvDayReport';
    /**
     * 描述 : 监听页面
     * 作者 : LiuYun
     */
    onPageReady = async (fetchSN) => {
        const data = this.parseData(fetchSN);
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
            var beforeDay = '';
            if (getDate && getDate.length != 0) {
                beforeDay = getDate[0].name.split('_')[1];
            }
            console.log(beforeDay);
            $("#page-size-dropdown > label > button").click();
            setTimeout(function(){
                $("#portal > div > div > button:nth-child(1)").click();
                setTimeout(function(){
                    $('.rt-table .rt-tbody>.rt-tr-group .rt-tr').each(function(){
                        if($(this).find('p.sc-fzqARJ').eq(0).text() == 'Completed'){
                            $(this).find('a span.sc-fzpisO').trigger('click');
                            return false;
                        }
                    })
                },500);
            },500);
            const data = {};
            const date = new Date();
            const hourTime = date.getHours();
            if (hourTime < 15) {
                date.setTime(date.getTime() - 86400000);
            }
            const accountCode = GM_config.get('accountCode');
            const siteCode = matchSiteCodeNew($.trim($("#AACChromeHeaderAccountDropdown > button > div:nth-child(2)").text()));
            const fileName = 'Sponsored Products Advertised product report';
            data['fileName'] = fileName !== '' ? fileName + ".xlsx" : fileName;
            data['newFileName'] = 'advProductReport_' + accountCode + '_' + siteCode + '_' + beforeDay + '_' + moment().format('YYYYMMDDHHmmss');
            this.onDataFrameReady(data.fileName, data.newFileName, null);
        });
    };
}

module.exports = runAdvDayReport;