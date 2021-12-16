const DataFrame = dfjs.DataFrame;
const {
    createUrlGetter,
    matchSiteCode
} = require('./helper');
const log = require('./logger');
const anchorFilter = (ele) => {
    /** 暂停状态，不抓取 */
    return $(ele).closest('tr').find('span.status-0').length <= 0;
};
const newUrlsGetter = createUrlGetter('#cards-container', anchorFilter);

class earlyReviewer {
    constructor() {
        this.findNewUrl = true;
        //this.onDataFrameReady = this.saveData;
    }

    id = 'earlyReviewerInfo';
    onPageReady = async () => {
        //下载评论人数据
        this.downloadEarlyData();
    };
    downloadEarlyData = async () => {
        var pageNum = $(".mt-row div[data-column=sdFieldDataAsinId]").length;
        if (pageNum > 0) {
            const dataFrame = this.parseData();
        }
    };
    triggerOnUrl = (url) => {
        return !!url && !!url.match(/https:\/\/sellercentral.amazon.com\/early-reviewer-program\/(.*)/);
    };
    getUrlsToAdd = () => {
        return this.findNewUrl ? newUrlsGetter() : [];
    };
    parseData = () => {
        const prefix = "early_";
        const timeStr = moment().format('YYYYMMDDHHmmss');
        const columns = ['Asin', 'siteCode', 'shopName'];
        const data = [];
        const accountCode = GM_config.get('accountCode');
        const siteCode = matchSiteCode($.trim($("#sc-mkt-picker-switcher-select").find("option:selected").text()));
        if (siteCode === '') {
            console.log('匹配站点失败');
            return false;
        }
        $(".mt-row div[data-column=sdFieldDataAsinId]").each(function () {
            var list = [];
            list.push($.trim($(this).text()));
            list.push(siteCode);
            list.push(accountCode);
            data.push(list);
        });
        let dataFrame = new DataFrame(data, columns);
        this.onDataFrameReady(prefix + accountCode + '_' + siteCode + '_' + timeStr + ".csv", '', dataFrame);
    };
}

module.exports = earlyReviewer;