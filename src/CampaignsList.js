const {
    createUrlGetter,
    matchSiteCode,
    matchSiteCodeNew
} = require('./helper');
const log = require('./logger');
const anchorFilter = (ele) => {
    /** 暂停状态，不抓取 */
    return $(ele).closest('tr').find('span.status-0').length <= 0;
};
const newUrlsGetter = createUrlGetter('#CAMPAIGNS', anchorFilter);

class CampaignsList {
    /**
     * 描述 : 构造初始化
     * 作者 : LiuYun
     */
    constructor() {
        this.findNewUrl = true;
        this.onDataFrameReady = this.saveData;
    }

    id = 'CampaignsInfo';
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
        return !!url && !!url.match(/https:\/\/(sellercentral|advertising).amazon.com\/cm\/campaigns(.*)/);
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
        const ret = $('#CAMPAIGNS').length > 0;
        log.debug('isPageReady:', ret);
        return ret;
    };
    /**
     * 描述 : 保存数据
     * 参数 :
     *       dataFrame : 数据框
     * 作者 : LiuYun
     */
    saveData = async (fileName, dataFrame) => {
        console.log(fileName, dataFrame);
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
        const fileName = $("#sc-lang-switcher-header-select").val() === 'zh_CN' ? 'Campaigns_' + (date.getMonth() + 1) + '月_' + date.getDate() + '_' + date.getFullYear() : 'Campaigns_' + date.toDateString().split(" ")[1] + '_' + date.getDate() + '_' + date.getFullYear();
        window.onload = function () {
            console.log(fetchSN)
        };
        $("button[data-e2e-id='export']").click();
        const accountCode = GM_config.get('accountCode');
        var siteCode = matchSiteCode($.trim($("#sc-mkt-picker-switcher-select").find("option:selected").text()));
        //站点获取失败时
        if (!siteCode) {
            siteCode = matchSiteCodeNew($.trim($("#AACChromeHeaderAccountDropdown > button > div:nth-child(2)").text()));
        }
        data['fileName'] = fileName + ".csv";
        data['newFileName'] = 'campaigns_' + accountCode + '_' + siteCode + '_' + moment().format('YYYYMMDDHHmmss');
        data['dataFrame'] = null;
        return data;
    };
}

module.exports = CampaignsList;