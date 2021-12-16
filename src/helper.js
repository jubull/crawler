const createUrlGetter = (cssSelector, filter = undefined) => () => {
    const list = [];
    const queryList = $(cssSelector);
    queryList.each(function () {
        if (filter && !filter(this)) return;
        const url = $(this).attr('href');
        if (!url) return;
        if (url.startsWith('#')) {
            list.push('' + url)
        } else if (url.startsWith('https')) {
            list.push(url)
        }
    });
    return list;
};

/**
 * 描述 : 解析广告组的统计数据字段
 * 参数 :
 *       selector : 元素选择器
 * 返回 :
 *       返回数组
 * 注明 : 获取所有的字段追加到数组中
 * 作者 : LiuYun
 */
function extractColumnsField(selector) {
    const fieldList = [];
    $(selector).find('div._8bOlfiA6ganJeB-WUZfv > h4 > div.UCFsU_q5shUQiFIepq8ox').each(function () {
        fieldList.push($(this).text());
    });
    return fieldList;
}

/**
 * 描述 : 解析广告组的统计数据
 * 参数 :
 *       selector : 元素选择器
 * 返回 :
 *       返回数组
 * 注明 : 获取所有的字段追加到数组中
 * 作者 : LiuYun
 */
function extractDataField(selector) {
    const dataList = [];
    $(selector).find('div._8bOlfiA6ganJeB-WUZfv > p > span').each(function () {
        dataList.push($(this).text());
    });
    return dataList;
}

/**
 * 描述 : 将两个一维数组组成一个键值对的对象
 * 参数 :
 *       keyArr : 对象键值
 *       valueArr : 对象值
 * 返回 :
 *       返回对象
 * 作者 : LiuYun
 */
function transformObject(keyArr, valueArr) {
    var obj = {};
    keyArr.map((v, i) => {
        obj[keyArr[i]] = valueArr[i];
    });
    return obj;
}


function extractDataFromTable(table, row = 'tr', cell = 'td', textExtractor = undefined) {
    const ret = [];
    $(table).find(row).each(function () {
        const row = [];
        $(this).find(cell).each(function () {
            textExtractor = textExtractor || ((ele) => simplifyText($(ele).text()));
            row.push(textExtractor(this));
        });
        ret.push(row);
    });
    return ret;
}

function simplifyText(str) {
    var ret = str || '';
    ret = ret.replace(/[\s\r\n\t\ue000-\uffff]|(󰅂)|(Ũ)/g, '');
    ret = ret.trim();
    return ret;
}

function extractDataAndSimplify(table, row = 'tr', cell = 'td') {
    return extractDataFromTable(table, row, cell);
}


function concat2DArray(left, right) {
    return left.map((value, index) => value.concat(right[index]));
}


function getParameterFromUrl(url, name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
}

function downloadXls(data, fileName) {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'people.csv';
    hiddenElement.click();
}

function matchSiteCode(siteUrl) {
    switch (siteUrl) {
        case 'www.amazon.com':
            return 'US';
        case 'www.amazon.ca':
            return 'CA';
        case 'www.amazon.com.mx':
            return 'MX';
        case 'www.amazon.co.uk':
            return 'UK';
        case 'www.amazon.de':
            return 'DE';
        case 'www.amazon.fr':
            return 'FR';
        case 'www.amazon.it':
            return 'IT';
        case 'www.amazon.es':
            return 'ES';
        case 'www.amazon.ae':
            return 'AE';
        case 'www.amazon.jp':
            return 'JP';
        default:
            return '';
    }
}

function matchSiteCodeNew(siteStr) {
    switch (siteStr) {
        case 'United States':
            return 'US';
        case 'Canada':
            return 'CA';
        default:
            return '';
    }
}

module.exports = {
    createUrlGetter,
    extractDataFromTable,
    simplifyText,
    extractDataAndSimplify,
    extractColumnsField,
    extractDataField,
    transformObject,
    concat2DArray,
    getParameterFromUrl,
    matchSiteCode,
    matchSiteCodeNew
};