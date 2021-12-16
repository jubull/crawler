const {
    createUrlGetter,
    matchSiteCode
} = require('./helper');
const log = require('./logger');
const anchorFilter = (ele) => {
    /** 暂停状态，不抓取 */
    return $(ele).closest('tr').find('span.status-0').length <= 0;
};
const newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

class BusinessReports {
    /**
     * 描述 : 构造初始化
     * 作者 : LiuYun
     */
    constructor() {
        this.findNewUrl = true;
        this.onDataFrameReady = this.saveData;
    }

    id = 'BusinessReports';
    /**
     * 描述 : 监听页面
     * 作者 : LiuYun
     */
    onPageReady = async (fetchSN) => {
        const data = this.parseData(fetchSN);
        await this.onDataFrameReady(data.fileName, data.newFileName, data.dataFrame = null);
    };
    /**
     * 描述 : 连接
     * 作者 : LiuYun
     */
    triggerOnUrl = (url) => {
        return !!url && !!url.match(/(http:\/\/sellercentral.amazon.com\/gp\/site-metrics\/report.html)?\/(.*)/);
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
        const data = {};
        const date = new Date();
        const hourTime = date.getHours();
        if (hourTime < 15) {
            date.setTime(date.getTime() - 86400000);
        }
        const fileName = $("#sc-lang-switcher-header-select").val() === 'zh_CN' ? '业务报告-' + date.getYear().toString().substr(1, 2) + '-' + (date.getMonth() + 1) + '-' + date.getDate() : 'BusinessReport-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getYear().toString().substr(1, 2);
        $('#export').click();
        $('#downloadCSV').click();
        const accountCode = GM_config.get('accountCode');
        const siteCode = matchSiteCode($.trim($("#sc-mkt-picker-switcher-select").find("option:selected").text()));
        data['fileName'] = fileName !== '' ? fileName + ".csv" : fileName;
        data['newFileName'] = 'BusinessReport_' + accountCode + '_' + siteCode + '_' + moment().format('YYYYMMDDHHmmss');
        data['dataFrame'] = null;
        return data;
    };
}

module.exports = BusinessReports;