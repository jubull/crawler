(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DataFrame = dfjs.DataFrame;

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    extractDevColumns = _require.extractDevColumns,
    extractDevData = _require.extractDevData,
    transformObject = _require.transformObject;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var AdvertisingReports =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function AdvertisingReports() {
  var _this = this;

  _classCallCheck(this, AdvertisingReports);

  _defineProperty(this, "id", 'campaigns');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var dataFrame;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              dataFrame = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(dataFrame);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/(http:\/\/advertising.amazon.com\/sspa\/tresah)?\/(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataFrame) {
      var _require2, db;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _require2 = require('./db'), db = _require2.db;
              _context2.next = 3;
              return db['campaigns_log'].bulkPut(dataFrame.toCollection());

            case 3:
              _context2.next = 5;
              return db['headers'].put({
                table_name: 'campaigns_log',
                'columns': dataFrame.listColumns()
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    var WebSql = require('./WebSql.js');

    var WebSqlObj = new WebSql();
    var continueFlag = $("#advertising-reports > div > div > div > div.sc-fzonZV.fjLydT > div > a").attr("href"); //新版本广告页面才生成

    if (!!continueFlag) {
      var linkA = [];
      var addFlag = false;
      var dateObj = new Date();
      var today = dateObj.getMonth() + '-' + dateObj.getDate(); //Term报表下载

      var oneTermDay = localStorage.getItem("oneTermDay");

      if (oneTermDay != today) {
        var oneTermRows = {
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
      } //1天adv报表下载,下载连续最近七天


      var needAdvDay = [];

      for (var i = 8; i >= 2; i--) {
        var timeObj = new Date(dateObj.getTime() - i * 24 * 60 * 60 * 1000);
        var timeMoon = timeObj.getMonth() + 1;
        needAdvDay.push(timeMoon + '-' + timeObj.getDate());
      }

      var advDayReportList = localStorage.getItem("oneAdvDay");
      var advDayReportArr = [];

      if (advDayReportList) {
        advDayReportArr = advDayReportList.split(",");
      }

      $.each(needAdvDay, function (k, v) {
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
      }); //7天adv报表下载

      var sevenAdvDay = localStorage.getItem("sevenAdvDay");

      if (sevenAdvDay != today) {
        var sevenAdvRows = {
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
      } //广告组列表下载


      var campaignsDay = localStorage.getItem("campaignsDay");

      if (campaignsDay != today) {
        var campaignsRows = {
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
        WebSqlObj.add("yafex", linkA).then(function (data) {
          console.log(data);
        });
      }
    }
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = AdvertisingReports;

},{"./WebSql.js":10,"./db":14,"./helper":15,"./logger":17}],2:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    matchSiteCode = _require.matchSiteCode;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var BusinessReports =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function BusinessReports() {
  var _this = this;

  _classCallCheck(this, BusinessReports);

  _defineProperty(this, "id", 'BusinessReports');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              data = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(data.fileName, data.newFileName, data.dataFrame = null);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/(http:\/\/sellercentral.amazon.com\/gp\/site-metrics\/report.html)?\/(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataFrame) {
      var _require2, db;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _require2 = require('./db'), db = _require2.db;
              _context2.next = 3;
              return db['campaigns_log'].bulkPut(dataFrame.toCollection());

            case 3:
              _context2.next = 5;
              return db['headers'].put({
                table_name: 'campaigns_log',
                'columns': dataFrame.listColumns()
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    var data = {};
    var date = new Date();
    var hourTime = date.getHours();

    if (hourTime < 15) {
      date.setTime(date.getTime() - 86400000);
    }

    var fileName = $("#sc-lang-switcher-header-select").val() === 'zh_CN' ? '业务报告-' + date.getYear().toString().substr(1, 2) + '-' + (date.getMonth() + 1) + '-' + date.getDate() : 'BusinessReport-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getYear().toString().substr(1, 2);
    $('#export').click();
    $('#downloadCSV').click();
    var accountCode = GM_config.get('accountCode');
    var siteCode = matchSiteCode($.trim($("#sc-mkt-picker-switcher-select").find("option:selected").text()));
    data['fileName'] = fileName !== '' ? fileName + ".csv" : fileName;
    data['newFileName'] = 'BusinessReport_' + accountCode + '_' + siteCode + '_' + moment().format('YYYYMMDDHHmmss');
    data['dataFrame'] = null;
    return data;
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = BusinessReports;

},{"./db":14,"./helper":15,"./logger":17}],3:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    matchSiteCode = _require.matchSiteCode;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var BusinessReportsPages =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function BusinessReportsPages() {
  var _this = this;

  _classCallCheck(this, BusinessReportsPages);

  _defineProperty(this, "id", 'BusinessReportsPages');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              data = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(data.fileName, data.newFileName, data.dataFrame = null);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/https:\/\/sellercentral.amazon.com\/gp\/site-metrics(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#report_DetailSalesTrafficByChildItem').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(fileName, dataFrame) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              console.log(fileName, dataFrame);

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    var data = {};
    var date = new Date();
    var hourTime = date.getHours();

    if (hourTime < 15) {
      date.setTime(date.getTime() - 86400000);
    }

    var fileName = $("#sc-lang-switcher-header-select").val() === 'zh_CN' ? '业务报告-' + date.getYear().toString().substr(1, 2) + '-' + (date.getMonth() + 1) + '-' + date.getDate() : 'BusinessReport-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getYear().toString().substr(1, 2);
    $('#export').click();
    $('#downloadCSV').click();
    var accountCode = GM_config.get('accountCode');
    var siteCode = matchSiteCode($.trim($("#sc-mkt-picker-switcher-select").find("option:selected").text()));
    data['fileName'] = fileName !== '' ? fileName + ".csv" : fileName;
    data['newFileName'] = 'businessReports_' + accountCode + '_' + siteCode + '_' + moment().format('YYYYMMDDHHmmss');
    data['dataFrame'] = null;
    return data;
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = BusinessReportsPages;

},{"./helper":15,"./logger":17}],4:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    matchSiteCode = _require.matchSiteCode,
    matchSiteCodeNew = _require.matchSiteCodeNew;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#CAMPAIGNS', anchorFilter);

var CampaignsList =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function CampaignsList() {
  var _this = this;

  _classCallCheck(this, CampaignsList);

  _defineProperty(this, "id", 'CampaignsInfo');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              data = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(data.fileName, data.newFileName, data.dataFrame = null);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/https:\/\/(sellercentral|advertising).amazon.com\/cm\/campaigns(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#CAMPAIGNS').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(fileName, dataFrame) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              console.log(fileName, dataFrame);

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    var data = {};
    var date = new Date();
    var hourTime = date.getHours();

    if (hourTime < 15) {
      date.setTime(date.getTime() - 86400000);
    }

    var fileName = $("#sc-lang-switcher-header-select").val() === 'zh_CN' ? 'Campaigns_' + (date.getMonth() + 1) + '月_' + date.getDate() + '_' + date.getFullYear() : 'Campaigns_' + date.toDateString().split(" ")[1] + '_' + date.getDate() + '_' + date.getFullYear();

    window.onload = function () {
      console.log(fetchSN);
    };

    $("button[data-e2e-id='export']").click();
    var accountCode = GM_config.get('accountCode');
    var siteCode = matchSiteCode($.trim($("#sc-mkt-picker-switcher-select").find("option:selected").text())); //站点获取失败时

    if (!siteCode) {
      siteCode = matchSiteCodeNew($.trim($("#AACChromeHeaderAccountDropdown > button > div:nth-child(2)").text()));
    }

    data['fileName'] = fileName + ".csv";
    data['newFileName'] = 'campaigns_' + accountCode + '_' + siteCode + '_' + moment().format('YYYYMMDDHHmmss');
    data['dataFrame'] = null;
    return data;
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = CampaignsList;

},{"./helper":15,"./logger":17}],5:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DataFrame = dfjs.DataFrame;

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    extractDevColumns = _require.extractDevColumns,
    extractDevData = _require.extractDevData,
    transformObject = _require.transformObject;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var NewReport1 =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function NewReport1() {
  var _this = this;

  _classCallCheck(this, NewReport1);

  _defineProperty(this, "id", 'campaigns');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var dataFrame;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              dataFrame = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(dataFrame);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/(http:\/\/advertising.amazon.com)?\/(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataFrame) {
      var _require2, db;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _require2 = require('./db'), db = _require2.db;
              _context2.next = 3;
              return db['campaigns_log'].bulkPut(dataFrame.toCollection());

            case 3:
              _context2.next = 5;
              return db['headers'].put({
                table_name: 'campaigns_log',
                'columns': dataFrame.listColumns()
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    $("#cards-container > div > div > div > table > tbody > tr:nth-child(2) > td > label > button").click();
    setTimeout(function () {
      $('#portal > div > div > button:nth-child(1)').click();
      $('#cards-container > div > div > div > table > tbody > tr:nth-child(4) > td > button').click();
      setTimeout(function () {
        $('#portal > div > div > div > div > button:nth-child(2)').click();
      }, 1000);
    }, 1000);

    var WebSql = require('./WebSql.js');

    var WebSqlObj = new WebSql();
    var readData = WebSqlObj.read('yafex', 'where currentPage = "true"');
    readData.then(function (getDate) {
      if (getDate && getDate.length != 0) {
        var linkA = [{
          "name": 'RunReport1',
          "url": "domClick",
          "purl": getDate[0].url,
          "level": '2',
          "status": '0',
          "errStatus": '0',
          "currentPage": 'false'
        }];
        WebSqlObj.add("yafex", linkA).then(function (data) {
          console.log(data);
        });
      }
    });
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = NewReport1;

},{"./WebSql.js":10,"./db":14,"./helper":15,"./logger":17}],6:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DataFrame = dfjs.DataFrame;

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    extractDevColumns = _require.extractDevColumns,
    extractDevData = _require.extractDevData,
    transformObject = _require.transformObject;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var NewReport1 =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function NewReport1() {
  var _this = this;

  _classCallCheck(this, NewReport1);

  _defineProperty(this, "id", 'campaigns');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var dataFrame;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              dataFrame = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(dataFrame);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/(http:\/\/advertising.amazon.com)?\/(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataFrame) {
      var _require2, db;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _require2 = require('./db'), db = _require2.db;
              _context2.next = 3;
              return db['campaigns_log'].bulkPut(dataFrame.toCollection());

            case 3:
              _context2.next = 5;
              return db['headers'].put({
                table_name: 'campaigns_log',
                'columns': dataFrame.listColumns()
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    $("#cards-container > div > div > div > table > tbody > tr:nth-child(2) > td > label > button").click();
    setTimeout(function () {
      $('#portal > div > div > button:nth-child(3)').click();
      $('#cards-container > div > div > div > table > tbody > tr:nth-child(4) > td > button').click();
      setTimeout(function () {
        $('#portal > div > div > div > div > button:nth-child(7)').click();
      }, 1000);
    }, 1000);

    var WebSql = require('./WebSql.js');

    var WebSqlObj = new WebSql();
    var readData = WebSqlObj.read('yafex', 'where currentPage = "true"');
    readData.then(function (getDate) {
      if (getDate && getDate.length != 0) {
        var linkA = [{
          "name": 'RunReport3',
          "url": "domClick",
          "purl": getDate[0].url,
          "level": '2',
          "status": '0',
          "errStatus": '0',
          "currentPage": 'false'
        }];
        WebSqlObj.add("yafex", linkA).then(function (data) {
          console.log(data);
        });
      }
    });
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = NewReport1;

},{"./WebSql.js":10,"./db":14,"./helper":15,"./logger":17}],7:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DataFrame = dfjs.DataFrame;

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    matchSiteCodeNew = _require.matchSiteCodeNew;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var RunReport1 =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function RunReport1() {
  var _this = this;

  _classCallCheck(this, RunReport1);

  _defineProperty(this, "id", 'campaigns');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              data = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(data.fileName, data.newFileName, data.dataFrame = null);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/(http:\/\/advertising.amazon.com)?\/(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataFrame) {
      var _require2, db;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _require2 = require('./db'), db = _require2.db;
              _context2.next = 3;
              return db['campaigns_log'].bulkPut(dataFrame.toCollection());

            case 3:
              _context2.next = 5;
              return db['headers'].put({
                table_name: 'campaigns_log',
                'columns': dataFrame.listColumns()
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    $("#page-size-dropdown > label > button").click();
    setTimeout(function () {
      $("#portal > div > div > button:nth-child(1)").click();
      setTimeout(function () {
        $('.rt-table .rt-tbody>.rt-tr-group').each(function () {
          if ($(this).find('p.sc-fzoyTs').eq(0).text() == 'Completed') {
            $(this).find('a .jHQZJv').trigger('click');
            return false;
          }
        });
      }, 1000);
    }, 1000);
    var data = {};
    var date = new Date();
    var hourTime = date.getHours();

    if (hourTime < 15) {
      date.setTime(date.getTime() - 86400000);
    }

    var accountCode = GM_config.get('accountCode');
    var siteCode = matchSiteCodeNew($.trim($("#AACChromeHeaderAccountDropdown > button > div:nth-child(2)").text()));
    var fileName = 'Sponsored Products Search term report';
    data['fileName'] = fileName !== '' ? fileName + ".xlsx" : fileName;
    data['newFileName'] = 'advSearchTermReport_' + accountCode + '_' + siteCode + '_' + moment().format('YYYYMMDDHHmmss');
    console.log(data);
    return data;
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = RunReport1;

},{"./db":14,"./helper":15,"./logger":17}],8:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DataFrame = dfjs.DataFrame;

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    matchSiteCodeNew = _require.matchSiteCodeNew;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var RunReport1 =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function RunReport1() {
  var _this = this;

  _classCallCheck(this, RunReport1);

  _defineProperty(this, "id", 'campaigns');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              data = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(data.fileName, data.newFileName, data.dataFrame = null);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/(http:\/\/advertising.amazon.com)?\/(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataFrame) {
      var _require2, db;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _require2 = require('./db'), db = _require2.db;
              _context2.next = 3;
              return db['campaigns_log'].bulkPut(dataFrame.toCollection());

            case 3:
              _context2.next = 5;
              return db['headers'].put({
                table_name: 'campaigns_log',
                'columns': dataFrame.listColumns()
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    $("#page-size-dropdown > label > button").click();
    setTimeout(function () {
      $("#portal > div > div > button:nth-child(1)").click();
      setTimeout(function () {
        $('.rt-table .rt-tbody>.rt-tr-group').each(function () {
          if ($(this).find('p.sc-fzoyTs').eq(0).text() == 'Completed') {
            $(this).find('a .jHQZJv').trigger('click');
            return false;
          }
        });
      }, 1000);
    }, 1000);
    var data = {};
    var date = new Date();
    var hourTime = date.getHours();

    if (hourTime < 15) {
      date.setTime(date.getTime() - 86400000);
    }

    var accountCode = GM_config.get('accountCode');
    var siteCode = matchSiteCodeNew($.trim($("#AACChromeHeaderAccountDropdown > button > div:nth-child(2)").text()));
    var fileName = 'Sponsored Products Advertised product report';
    data['fileName'] = fileName !== '' ? fileName + ".xlsx" : fileName;
    data['newFileName'] = 'advertisingReports_' + accountCode + '_' + siteCode + '_' + moment().format('YYYYMMDDHHmmss');
    console.log(data);
    return data;
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = RunReport1;

},{"./db":14,"./helper":15,"./logger":17}],9:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DataFrame = dfjs.DataFrame;

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var Sellercentral =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function Sellercentral() {
  var _this = this;

  _classCallCheck(this, Sellercentral);

  _defineProperty(this, "id", 'campaigns');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var dataFrame;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              dataFrame = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(dataFrame);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/(http:\/\/sellercentral.amazon.com\/gp\/homepage.html)?\/(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataFrame) {
      var _require2, db;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _require2 = require('./db'), db = _require2.db;
              _context2.next = 3;
              return db['campaigns_log'].bulkPut(dataFrame.toCollection());

            case 3:
              _context2.next = 5;
              return db['headers'].put({
                table_name: 'campaigns_log',
                'columns': dataFrame.listColumns()
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    var WebSql = require('./WebSql.js');

    var WebSqlObj = new WebSql();
    var linkA = [];
    var adReports = {};
    $("#sc-navtab-reports > ul > li").each(function (i, v) {
      var rows = {
        "name": '',
        "url": '',
        "purl": window.location.href,
        "level": '1',
        "status": '0',
        "errStatus": '0',
        "currentPage": 'false'
      };
      rows.name = $(this).find('a').html().trim().replace(' ', '');
      rows.url = $(this).find('a').attr('href');

      if (rows.name == 'AdvertisingReports') {
        adReports = rows;
      }
    });
    var dateObj = new Date();
    var today = dateObj.getMonth() + '-' + dateObj.getDate(); //添加1、7天business报表下载 需编辑链接

    var endObj = new Date(dateObj.getTime() - 2 * 24 * 60 * 60 * 1000);
    var startObj = new Date(dateObj.getTime() - 8 * 24 * 60 * 60 * 1000);
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

    var startTime = startMoon + '/' + startDay + '/' + startObj.getFullYear();
    var endTime = endMoon + '/' + endDay + '/' + endObj.getFullYear();
    /*1天*/

    var oneBusinessDay = localStorage.getItem("oneBusinessDay");

    if (oneBusinessDay != today) {
      var oneBusinessUrl = "https://sellercentral.amazon.com/gp/site-metrics/report.html#&cols=/c0/c1/c2/c3/c4/c5/c6/c7/c8/c9/c10/c11&sortColumn=12&filterFromDate=" + endTime + "&filterToDate=" + endTime + "&fromDate=" + endTime + "&toDate=" + endTime + "&reportID=102:DetailSalesTrafficByChildItem&sortIsAscending=0&currentPage=0&dateUnit=1&viewDateUnits=ALL&runDate=";
      var oneBusinessRows = {
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
      var sevenBusinessUrl = "https://sellercentral.amazon.com/gp/site-metrics/report.html#&cols=/c0/c1/c2/c3/c4/c5/c6/c7/c8/c9/c10/c11&sortColumn=12&filterFromDate=" + startTime + "&filterToDate=" + endTime + "&fromDate=" + startTime + "&toDate=" + endTime + "&reportID=102:DetailSalesTrafficByChildItem&sortIsAscending=0&currentPage=0&dateUnit=1&viewDateUnits=ALL&runDate=";
      var sevenBusinessRows = {
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
    WebSqlObj.add("yafex", linkA).then(function (data) {
      console.log(data);
    });
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = Sellercentral;

},{"./WebSql.js":10,"./db":14,"./helper":15,"./logger":17}],10:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var log = require('./logger');

var WebSql = /*#__PURE__*/function () {
  function WebSql(options) {
    _classCallCheck(this, WebSql);

    options = options || {};
    this.database = null;
    this.DateBaseName = options.DateBaseName || 'RedDB';
    this.Version = options.Version || '1.0';
    this.Description = options.Description || '亚马逊爬虫数据库';
    this.DataBaseSize = options.DataBaseSize || 2 * 1024 * 1024;
    this.init();
  }
  /**
   * 描述 : 初始化数据库
   * 作者 : LiuYun
   */


  _createClass(WebSql, [{
    key: "init",
    value: function init() {
      this.database = openDatabase(this.DateBaseName, this.Version, this.Description, this.DataBaseSize);
    }
    /**
     * 描述 : 批量添加字段
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          arr : [
     *              {key1：value1 , key2 : value2 ...},
     *              {key1：value1 , key2 : value2 ...}
     *          ]
     *          index : BLOG字段所在的索引位置
     *          isFirst : 是否是第一次创建表
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "addBlob",
    value: function addBlob(tableName, arr, index) {
      var isFirst = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var _db = this.database;

      var _me = this;

      return new Promise(function (resovle, reject) {
        if (arr == null) {
          return this;
        }

        var keyC = [];
        var keyI = [];
        var _key = '';
        arr = arr || [];

        if (arr && arr.constructor == Array) {
          for (var i in arr[0]) {
            keyC.push(i);
            keyI.push(i);
          }

          keyC[0] = keyC[0] + ' unique';
          _key = keyI.join(',');
          index = index == undefined ? 0 : index;
          keyC[index] = keyC[index] + ' BLOB';

          _db.transaction(function (tx, result) {
            if (isFirst == true) {
              tx.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + keyC.join(',') + ')');
              console.log('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + keyC.join(',') + ')');
            }

            for (var s = 0, _len = arr.length; s < _len; s++) {
              var _value = _me.split(arr[s]);

              tx.executeSql('INSERT INTO ' + tableName + ' (' + _key + ') VALUES (' + _value + ')', [], function (tx, result) {
                resovle(result.rowsAffected);
                log.debug('添加成功:', result.rowsAffected);
              }, function (tx) {
                log.debug('添加失败:');
                reject(false);
              });
            }

            _key = keyI = keyC = null;
            resovle(arr.length);
          });
        }
      })["catch"](function (error) {
        console.log('error :', error);
      });
    }
    /**
     * 描述 : 批量添加字段
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          arr : [
     *              {key1：value1 , key2 : value2 ...},
     *              {key1：value1 , key2 : value2 ...}
     *          ]
     *          index : BLOG字段所在的索引位置
     *          firstKey : firstKey 第一个字段是否是主键（默认是）
     *          isFirst : 是否是第一次创建表
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "patchAddBlob",
    value: function patchAddBlob(tableName, arr, index) {
      var firstKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var isFirst = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      var _db = this.database;

      var _me = this;

      return new Promise(function (resovle, reject) {
        if (arr == null) {
          return this;
        }

        var keyC = [];
        var keyI = [];
        var _key = '';
        arr = arr || [];

        if (arr && arr.constructor == Array) {
          for (var i in arr[0]) {
            keyC.push(i);
            keyI.push(i);
          }

          if (firstKey) {
            keyC[0] = keyC[0] + ' unique';
          }

          _key = keyI.join(',');
          index = index == undefined ? 0 : index;
          keyC[index] = keyC[index] + ' text';

          _db.transaction(function (tx, result) {
            if (isFirst == true) {
              tx.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + keyC.join(',') + ')');
            }

            var sql = '';
            var _values = [];

            for (var s = 0, _len = arr.length; s < _len; s++) {
              _values.push('(' + _me.split(arr[s]) + ')');
            }

            sql = 'INSERT INTO ' + tableName + ' (' + _key + ') VALUES ' + _values.join(',');
            tx.executeSql(sql, [], function (tx, result) {
              resovle(result.rowsAffected);
            }, function (tx, error) {
              log.debug('添加失败:', tx + error);
              reject(false);
            });
            _key = keyI = keyC = null;
            resovle(arr.length);
          });
        }
      })["catch"](function (error) {
        console.log('error :', error);
      });
    }
    /**
     * 描述 : 批量添加字段 注 ： 数据里面的第一个key 为主键
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          arr : [
     *              {key1：value1 , key2 : value2 ...},
     *              {key1：value1 , key2 : value2 ...}
     *          ]
     *          index : BLOG字段所在的索引位置
     *          firstKey : firstKey 第一个字段是否是主键（默认是）
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "add",
    value: function add(tableName, arr) {
      var firstKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var _me = this;

      var _db = this.database;
      return new Promise(function (resovle, reject) {
        if (arr == null) {
          return this;
        }

        var keyC = [];
        var keyI = [];
        var _key = '';
        arr = arr || [];

        if (arr && arr.constructor == Array) {
          for (var i in arr[0]) {
            keyC.push(i);
            keyI.push(i);
          } // console.log(keyI);
          // console.log(keyC);


          if (firstKey) {
            keyC[0] = keyC[0] + ' unique';
          }

          _key = keyI.join(',');

          _db.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + keyC.join(',') + ')'); // console.log('CREATE TABLE IF NOT EXISTS ' +
            //     tableName +
            //     ' (' +
            //     keyC.join(',') +
            //     ')');

            for (var s = 0, _len = arr.length; s < _len; s++) {
              var _value = _me.split(arr[s]);

              tx.executeSql('INSERT INTO ' + tableName + ' (' + _key + ') VALUES (' + _value + ')', [], function (tx, result) {
                resovle(result.rowsAffected);
              }, function (tx, error) {
                log.debug('添加失败:', error);
                reject(false);
              });
            }

            _key = keyI = keyC = null;
            resovle(arr.length);
          });
        }
      })["catch"](function (error) {
        console.log('error :', error);
      });
    }
    /**
     * 描述 : 批量添加行记录 注 ： 数据里面的第一个key 为主键
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          arr : [
     *              {key1：value1 , key2 : value2 ...},
     *              {key1：value1 , key2 : value2 ...}
     *          ]
     *          firstKey : firstKey 第一个字段是否是主键（默认是）
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "patchAdd",
    value: function patchAdd(tableName, arr) {
      var firstKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var _me = this;

      var _db = this.database;
      return new Promise(function (resovle, reject) {
        if (arr == null) {
          return this;
        }

        var keyC = [];
        var keyI = [];
        var _key = '';
        arr = arr || [];

        if (arr && arr.constructor == Array) {
          for (var i in arr[0]) {
            keyC.push(i);
            keyI.push(i);
          }

          if (firstKey) {
            keyC[0] = keyC[0] + ' unique';
          }

          _key = keyI.join(',');

          _db.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + keyC.join(',') + ')');
            var sql = '';
            var _values = [];

            for (var s = 0, _len = arr.length; s < _len; s++) {
              _values.push('(' + _me.split(arr[s]) + ')');
            }

            sql = 'INSERT INTO ' + tableName + ' (' + _key + ') VALUES ' + _values.join(',');
            console.log('sql:' + sql);
            tx.executeSql(sql, [], function (tx, result) {
              resovle(result.rowsAffected);
            }, function (tx, error) {
              log.debug('添加失败:', error);
              reject(false);
            });
            _key = keyI = keyC = null;
            resovle(arr.length);
          });
        }
      })["catch"](function (error) {
        console.log('error :', error);
      });
    }
    /**
     * 描述 : 更新指定数据
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          key : 查询的键
     *          value : 对应键的值
     *          obj : {
     *                  key1：value1 ,
     *                  key2 : value2
     *                  ...
     *                }
     *          firstKey : firstKey 第一个字段是否是主键（默认是）
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "update",
    value: function update(tableName, key, value, obj) {
      var _db = this.database;

      var _value = this.splitU(obj);

      return new Promise(function (resovle, reject) {
        _db.transaction(function (tx) {
          tx.executeSql('UPDATE ' + tableName + ' set ' + _value + ' where ' + key + '="' + value + '"', [], function (tx, result) {
            resovle(result.rowsAffected);
          }, function (tx, error) {
            log.debug('添加失败:', error);
            reject(false);
          });
        });
      })["catch"](function (error) {
        console.log('error :', error);
      });
    }
    /**
     * 描述 : 批量添加行记录 注 ： 数据里面的第一个key 为主键
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          condition : 查询条件
     *          obj :  {
     *              key1：value1 ,
     *              key2 : value2，
     *              ...
     *          }
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "updateWhere",
    value: function updateWhere(tableName, condition, obj) {
      var _db = this.database;

      var _value = this.splitU(obj);

      return new Promise(function (resovle, reject) {
        _db.transaction(function (tx) {
          console.log('UPDATE ' + tableName + ' set ' + _value + ' ' + condition);
          tx.executeSql('UPDATE ' + tableName + ' set ' + _value + +' ' + condition, [], function (tx, result) {
            resovle(result.rowsAffected);
          }, function (tx, error) {
            log.debug('添加失败:', error);
            reject(false);
          });
        });
      })["catch"](function (error) {
        console.log('error :', error);
      });
    }
    /**
     * 描述 : 读取表数据
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          condition : 查询条件 'where name="LiuYun"'
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "read",
    value: function read(tableName, condition) {
      var _db = this.database;

      var _me = this;

      return new Promise(function (resovle, reject) {
        var _condition = _me.isString(condition) ? condition : '';

        var _re = [];

        _db.transaction(function (tx) {
          tx.executeSql('SELECT * FROM ' + tableName + ' ' + _condition + ' ', [], function (tx, results) {
            if (results && results.rows) {
              _re = _me.toArray(results.rows);
              resovle(_re);
            } else {
              resovle([]);
            }
          }, function (tx, error) {
            reject([]);
            log.debug('添加失败:', error);
          });
        });
      })["catch"](function (error) {
        console.log('error :', error);
      });
    }
    /**
     * 描述 : 读取表数据
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          field : 查询字段，逗号隔开
     *          condition : 查询条件   'where name="LiuYun"'
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "readField",
    value: function readField(tableName) {
      var field = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '*';
      var condition = arguments.length > 2 ? arguments[2] : undefined;
      var _db = this.database;

      var _me = this;

      return new Promise(function (resovle, reject) {
        var _condition = _me.isString(condition) ? condition : '';

        var _re = [];

        _db.transaction(function (tx) {
          tx.executeSql('SELECT ' + field + ' FROM ' + tableName + ' ' + _condition + ' ', [], function (tx, results) {
            if (results && results.rows) {
              _re = _me.toArray(results.rows);
              resovle(_re);
            } else {
              resovle([]);
            }
          }, function (tx, error) {
            reject([]);
            log.debug('添加失败:', error);
          });
        });
      })["catch"](function (error) {
        console.log('error :', error);
      });
    }
    /**
     * 描述 : 删除数据
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          condition : 查询条件   'where name="LiuYun"'
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "remove",
    value: function remove(tableName, condition) {
      var _me = this;

      var _condition = _me.isString(condition) ? condition : '';

      return new Promise(function (resovle, reject) {
        _me.database.transaction(function (tx) {
          tx.executeSql('DELETE FROM ' + tableName + ' ' + _condition + ' ', [], function (tx, result) {
            resovle(result.rowsAffected);
          }, function (tx, error) {
            reject(false);
            log.debug('删除失败:', error);
          });
        });
      })["catch"](function (error) {
        console.log('error :', error);
      });
    }
    /**
     * 描述 : 根据查询条件读取表记录数
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          condition : 查询条件   'where name="LiuYun"'
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "counts",
    value: function counts(tableName, condition) {
      try {
        if (browserVersions.android) {
          return this.androidCounts(tableName, condition);
        } else {
          return this.iosCounts(tableName, condition);
        }
      } catch (_unused) {
        return 0;
      }
    }
    /**
     * 描述 : 读取表数据(ios下面特有的)
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          condition : 查询条件   'where name="LiuYun"'
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "iosCounts",
    value: function iosCounts(tableName, condition) {
      var _db = this.database;

      var _me = this;

      var _condition = _me.isString(condition) ? condition : '';

      return new Promise(function (resovle, reject) {
        var _re = [];

        _db.transaction(function (tx) {
          tx.executeSql('SELECT 1 FROM ' + tableName + ' ' + _condition + ' ', [], function (tx, results) {
            if (results && results.rows) {
              _re = _me.toArray(results.rows);
              resovle(_re.length);
            } else {
              resovle(0);
            }
          }, function (tx, error) {
            reject(0);
            log.debug('查询失败:', error);
          });
        });
      })["catch"](function (e) {
        console.log('e :', e);
      });
    }
    /**
     * 描述 : 读取表数据（Android）
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *          condition : 查询条件   'where name="LiuYun"'
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "androidCounts",
    value: function androidCounts(tableName, condition) {
      var _db = this.database;

      var _me = this;

      var _condition = _me.isString(condition) ? condition : '';

      return new Promise(function (resovle, reject) {
        var _re = [];

        _db.transaction(function (tx) {
          tx.executeSql('SELECT count (*) as num FROM ' + tableName + ' ' + _condition + ' ', [], function (tx, results) {
            if (results && results.rows) {
              if (results.rows[0]) {
                resovle(results.rows[0].num);
              } else {
                resovle(0);
              }
            } else {
              resovle(0);
            }
          }, function (tx, error) {
            reject(0);
            log.debug('查询失败:', error);
          });
        });
      })["catch"](function (e) {
        console.log('e :', e);
      });
    }
    /**
     * 描述 : 删除数据表
     * 参数 :
     *       $params : {
     *          tableName : 表名
     *        }
     * 作者 : LiuYun
     */

  }, {
    key: "delTable",
    value: function delTable(tableName) {
      var _db = this.database;
      console.log('_db :', _db);
      return new Promise(function (resovle, reject) {
        _db.transaction(function (tx) {
          tx.executeSql('DROP TABLE IF EXISTS ' + tableName, [], function (tx, res) {
            resovle(1);
          }, function (tx, err) {
            log.debug('删除数据表失败:', err);
            reject(0);
          });
        });
      });
    }
    /**
     * 描述 : 更新字符处理
     * 作者 : LiuYun
     */

  }, {
    key: "splitU",
    value: function splitU(obj) {
      var _arr = [];

      for (var t in obj) {
        _arr.push(t + '=\'' + obj[t] + '\'');
      }

      return _arr.join(',');
    }
    /**
     * 描述 : 添加字符处理
     * 作者 : LiuYun
     */

  }, {
    key: "split",
    value: function split(obj) {
      var _arr = [];

      for (var m in obj) {
        _arr.push('\'' + obj[m] + '\'');
      }

      return _arr.join(',');
    }
    /**
     * 描述 : 是否是方法
     * 作者 : LiuYun
     */

  }, {
    key: "isFunction",
    value: function isFunction(callback) {
      return !!(typeof callback != 'undefined' && callback.constructor == Function);
    }
    /**
     * 描述 : 是否是字符串
     * 作者 : LiuYun
     */

  }, {
    key: "isString",
    value: function isString(string) {
      return typeof string == 'string';
    }
    /**
     * 描述 : 对象转化为数组
     * 作者 : LiuYun
     */

  }, {
    key: "toArray",
    value: function toArray(obj) {
      var _arr = [];
      var _len = obj.length;

      if (_len > 0) {
        for (var i = 0; i < _len; i++) {
          _arr.push(obj.item(i));
        }
      }

      return _arr;
    }
    /**
    * 描述 : 根据当前url查找所有下级url
    * 作者 : LiuYun
    */

  }, {
    key: "getChildUrlByPurl",
    value: function getChildUrlByPurl(table, url) {
      //新增数据
      var result = this.read(table, 'where purl="' + url + '"');
      var newResult = [];
      var that = this;
      return new Promise(function (resovle, reject) {
        result.then(function (result) {
          if (Object.keys(result).length !== 0) {
            // result.forEach(function (v) {
            //     newResult[v['url']] = v;
            // });
            newResult = result;
            resovle(newResult);
          } else {
            resovle([]);
          } // if (Object.keys(newResult).length !== 0) {
          //     newResult.forEach(function (item, key) {
          //         let cUrl = that.getChildUrlByPurl(item['url']);
          //         if (Object.keys(newResult).length !== 0) {
          //             cUrl.then(function (data) {
          //                 newResult[key]['cell'] = data;
          //             });
          //         } else {
          //             resovle([])
          //         }
          //     });
          //     resovle(newResult)
          // } else {
          //     resovle([])
          // }

        })["catch"](function (error) {
          reject([]);
          console.log('查询失败 :', error);
        });
      })["catch"](function (error) {
        console.log('生成失败 :', error);
      });
    }
    /**
     * 描述 : 根据当前url查找对应的上级url
     * 作者 : LiuYun
     */

  }, {
    key: "getPrentUrlByUrl",
    value: function getPrentUrlByUrl(table, url) {
      //新增数据
      var result = this.read(table, 'where url="' + url + '"');
      var newResult = [];
      var that = this;
      return new Promise(function (resovle, reject) {
        result.then(function (result) {
          if (Object.keys(result).length !== 0) {
            // result.forEach(function (v) {
            //     newResult[v['url']] = v;
            // });
            newResult = result;
            resovle(newResult);
          } else {
            resovle([]);
          } // if (Object.keys(newResult).length !== 0) {
          //     newResult.forEach(function (item, key) {
          //         let pUrl = that.getPrentUrlByUrl(item['purl']);
          //         if (Object.keys(newResult).length !== 0) {
          //             pUrl.then(function (data) {
          //                 newResult[key]['pcell'] = data;
          //             });
          //         } else {
          //             resovle([])
          //         }
          //     });
          //     resovle(newResult)
          // } else {
          //     resovle([])
          // }

        })["catch"](function (error) {
          reject([]);
          console.log('查询失败 :', error);
        });
      })["catch"](function (error) {
        console.log('生成失败 :', error);
      });
    }
  }]);

  return WebSql;
}();

module.exports = WebSql;

},{"./logger":17}],11:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DataFrame = dfjs.DataFrame;

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    extractDevColumns = _require.extractDevColumns,
    extractDevData = _require.extractDevData,
    transformObject = _require.transformObject;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var advDayReport =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function advDayReport() {
  var _this = this;

  _classCallCheck(this, advDayReport);

  _defineProperty(this, "id", 'advDayReport');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var dataFrame;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              dataFrame = _this.parseData(fetchSN);
              _context.next = 3;
              return _this.onDataFrameReady(dataFrame);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/(http:\/\/advertising.amazon.com)?\/(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataFrame) {
      var _require2, db;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _require2 = require('./db'), db = _require2.db;
              _context2.next = 3;
              return db['campaigns_log'].bulkPut(dataFrame.toCollection());

            case 3:
              _context2.next = 5;
              return db['headers'].put({
                table_name: 'campaigns_log',
                'columns': dataFrame.listColumns()
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    var WebSql = require('./WebSql.js');

    var WebSqlObj = new WebSql();
    var readData = WebSqlObj.read('yafex', 'where currentPage = "true"');
    readData.then(function (getDate) {
      if (getDate && getDate.length != 0) {
        var beforeDay = getDate[0].name.split('_')[1];
        var obj = new Date();
        var thisObj = new Date(obj.getTime() - beforeDay * 24 * 60 * 60 * 1000);
        var moonList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var moon = thisObj.getMonth();
        var dayStr = moonList[moon] + " " + thisObj.getDate() + ", " + thisObj.getFullYear();
        $("#cards-container > div.sc-pReKu.eehIqb > div > div.sc-pRFjI.kqMATi > table > tbody > tr:nth-child(2) > td > label > button").click();
        setTimeout(function () {
          $('#portal > div > div > button:nth-child(3)').click();
          $("#cards-container > div.sc-pReKu.eehIqb > div > div.sc-pRFjI.kqMATi > table > tbody > tr:nth-child(4) > td > button").click();
          setTimeout(function () {
            var tdEq = '';
            $(".CalendarDay").each(function (i) {
              var ariaLabel = $(this).attr("aria-label");

              if (ariaLabel.indexOf(dayStr) != -1) {
                tdEq = i;
              }
            });

            if (tdEq !== '') {
              $(".CalendarDay").eq(tdEq).click();
              $("#portal > div > div > div > div.sc-pBolk.kPdszo > div.sc-pkhIR.jBEtKx > button.sc-AxirZ.qAlDi").click();
            }
          }, 1000);
        }, 1000);
        var linkA = [{
          "name": 'runAdvDayReport_' + beforeDay,
          "url": "domClick",
          "purl": getDate[0].url,
          "level": '2',
          "status": '0',
          "errStatus": '0',
          "currentPage": 'false'
        }];
        WebSqlObj.add("yafex", linkA).then(function (data) {
          console.log(data);
        });
      }
    });
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = advDayReport;

},{"./WebSql.js":10,"./db":14,"./helper":15,"./logger":17}],12:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('./retry'),
    check = _require.check,
    retry = _require.retry,
    waitUntil = _require.waitUntil;

var log = require('./logger');

var Page = /*#__PURE__*/function () {
  function Page() {
    _classCallCheck(this, Page);

    _defineProperty(this, "id", '');
  }

  _createClass(Page, [{
    key: "triggerOnUrl",
    value: function triggerOnUrl(url) {
      return false;
    }
  }, {
    key: "isPageReady",
    value: function isPageReady() {
      return false;
    }
  }, {
    key: "onPageReady",
    value: function onPageReady() {
      return true;
    }
  }, {
    key: "getUrlsToAdd",
    value: function getUrlsToAdd() {
      return [];
    }
  }]);

  return Page;
}();
/**
 * 爬虫调度器
 */


var Crawler =
/**
 * @type {CrawlerOption}
 */
// 每启动一次 crawler，将分配一个新的 SN，作为此次抓取的唯一标识符。
// 将要抓取的 URL
// 正在抓取的 URL

/**
 * @param {CrawlerOption} options
 */
function Crawler(options) {
  var _this = this;

  _classCallCheck(this, Crawler);

  _defineProperty(this, "options", _defineProperty({
    startPageURL: '',
    pageList: [],
    maxWait: 10000,
    retryCount: 3,
    operateInterval: 1000,
    minWait: 3000
  }, "maxWait", 8000));

  _defineProperty(this, "fetchSN", new Date().getTime());

  _defineProperty(this, "urlList", []);

  _defineProperty(this, "currUrl", null);

  _defineProperty(this, "crawledUrlSet", new Set());

  _defineProperty(this, "isCrawling", false);

  _defineProperty(this, "isPause", false);

  _defineProperty(this, "isToBeClear", false);

  _defineProperty(this, "clear", function () {
    _this.urlList = [];

    _this.crawledUrlSet.clear();

    _this.isPause = false;
    _this.isCrawling = false;
    _this.isToBeClear = true;
  });

  _defineProperty(this, "start", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            log.debug('_start', _this.urlList);
            _this.urlList = [_this.options.startPageURL];
            _this.isPause = false;
            _this.isToBeClear = false;
            _this.isCrawling = true;
            _this.fetchSN = new Date().getTime();
            return _context.abrupt("return", _this._start());

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));

  _defineProperty(this, "restoreFromSavedState", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(urlList, crawledUrlSet) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _this.urlList = urlList;
              _this.crawledUrlSet = crawledUrlSet;
              _this.isCrawling = true;
              _this.isPause = false;
              _this.isToBeClear = false;
              _this.fetchSN = new Date().getTime();
              return _context2.abrupt("return", _this._start());

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "pause", function () {
    log.debug('_pause: this.urlList:', _this.urlList);
    _this.isPause = true;
  });

  _defineProperty(this, "resume", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            log.debug('_resume: this.urlList:', _this.urlList);
            _this.isPause = false;
            return _context3.abrupt("return", _this._start());

          case 3:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })));

  _defineProperty(this, "_start", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    var _this$options, minWait, maxWait, onPageStart, onPageComplete, onCrawlComplete, timeToWait, url;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            log.debug('_start: begin. this.urlList:', _this.urlList);
            _this$options = _this.options, minWait = _this$options.minWait, maxWait = _this$options.maxWait, onPageStart = _this$options.onPageStart, onPageComplete = _this$options.onPageComplete, onCrawlComplete = _this$options.onCrawlComplete;
            timeToWait = Math.floor(Math.random() * (maxWait - minWait)) + minWait;

            if (!(_this.urlList.length > 0)) {
              _context4.next = 11;
              break;
            }

            url = _this.urlList.splice(0, 1)[0];
            _this.currUrl = url;

            _this.crawledUrlSet.add(url);

            if (onPageStart) onPageStart(url);
            return _context4.abrupt("return", _this._crawlPage(url)["catch"](function (reason) {
              /** 如果中间失败了，还是继续下一波，不要影响下一条任务 */
              log.error('_start: crawl page fail:', url, ', reason:', reason);
            }).then(function () {
              return new Promise(function (resolve, _) {
                _this.currUrl = null;
                if (onPageComplete) onPageComplete(url);
                log.debug('_stat: wait time = ', timeToWait);
                setTimeout(resolve, timeToWait);
              });
            }).then(function () {
              if (_this.isToBeClear) {
                if (onCrawlComplete) onCrawlComplete();
                return Promise.reject(Crawler.QUIT_REASON_CLEAR);
              } else if (_this.isPause) {
                return Promise.reject(Crawler.QUIT_REASON_PAUSE);
              } else {
                return _this._start();
              }
            }));

          case 11:
            _this.isCrawling = false;
            if (onCrawlComplete) onCrawlComplete();

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })));

  _defineProperty(this, "_openPageOnce", /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(url, isPageReady) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", _this.options.gotoUrl(url).then(function () {
                return waitUntil(isPageReady, _this.options.maxWait);
              }));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function (_x3, _x4) {
      return _ref5.apply(this, arguments);
    };
  }());

  _defineProperty(this, "_runFunctionAndLoginIfNeed", /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(fn) {
      var _len,
          args,
          _key,
          login,
          needLogin,
          _args6 = arguments;

      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              for (_len = _args6.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = _args6[_key];
              }

              login = _this.options.login;

              if (login) {
                _context6.next = 4;
                break;
              }

              return _context6.abrupt("return", fn.apply(void 0, args));

            case 4:
              needLogin = login.needLogin;

              if (!needLogin()) {
                _context6.next = 10;
                break;
              }

              console.log('需要登录先登录再爬取');
              return _context6.abrupt("return", _this.login().then(function () {
                return fn.apply(void 0, args);
              }));

            case 10:
              console.log('不需要登录直接爬取');
              return _context6.abrupt("return", Promise.reject()["catch"](function (e) {}));

            case 12:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function (_x5) {
      return _ref6.apply(this, arguments);
    };
  }());

  _defineProperty(this, "_openPageAndLoginIfNeed", /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(url) {
      var pageList, page, isPageReady, onPageReady, getUrlsToAdd;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              log.debug('_openPageAndLoginIfNeed: ', url);
              pageList = _this.options.pageList;
              page = pageList.find(function (r) {
                return r.triggerOnUrl(url);
              }); //匹配不到页面时，直接返回

              if (!(typeof page === 'undefined')) {
                _context8.next = 6;
                break;
              }

              log.debug('_openPageAndLoginIfNeed: ', '匹配不到页面');
              return _context8.abrupt("return", false);

            case 6:
              isPageReady = page.isPageReady, onPageReady = page.onPageReady, getUrlsToAdd = page.getUrlsToAdd;
              console.log(_this._runFunctionAndLoginIfNeed(_this._openPageOnce, url, isPageReady));
              return _context8.abrupt("return", _this._runFunctionAndLoginIfNeed(_this._openPageOnce, url, isPageReady).then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
                var newUrls;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        onPageReady(_this.fetchSN);
                        newUrls = getUrlsToAdd();
                        newUrls = newUrls.filter(function (u) {
                          return !_this.crawledUrlSet.has(u);
                        });
                        log.debug('_openPageAndLoginIfNeed. newUrls:', newUrls);
                        _this.urlList = _this.urlList.concat(newUrls);

                      case 5:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7);
              }))));

            case 9:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));

    return function (_x6) {
      return _ref7.apply(this, arguments);
    };
  }());

  _defineProperty(this, "_crawlPage", /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(url) {
      var retryCount;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              log.debug('_crawlPage: ', url);
              retryCount = _this.options.retryCount;
              return _context9.abrupt("return", retry(function () {
                return _this._openPageAndLoginIfNeed(url);
              }, retryCount));

            case 3:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    }));

    return function (_x7) {
      return _ref9.apply(this, arguments);
    };
  }());

  _defineProperty(this, "login", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    var _this$options2, login, maxWait, loginPageURL, isLoginPageReady, isLoginSuccess, doLogin, p;

    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            log.debug('login');
            _this$options2 = _this.options, login = _this$options2.login, maxWait = _this$options2.maxWait;

            if (login) {
              _context10.next = 6;
              break;
            }

            return _context10.abrupt("return");

          case 6:
            loginPageURL = login.loginPageURL, isLoginPageReady = login.isLoginPageReady, isLoginSuccess = login.isLoginSuccess, doLogin = login.doLogin;
            p = null;

            if (isLoginPageReady()) {
              log.debug('login: isLoginPageReady.');
              p = doLogin();
            } else {
              log.debug('login: needReload');
              p = _this._openPageOnce(loginPageURL, isLoginPageReady).then(doLogin);
            }

            return _context10.abrupt("return", p.then(function () {
              return waitUntil(isLoginSuccess, maxWait);
            }));

          case 10:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  })));

  for (var key in options) {
    this.options[key] = options[key];
  }
};

_defineProperty(Crawler, "QUIT_REASON_CLEAR", 'quit_reason_clear');

_defineProperty(Crawler, "QUIT_REASON_PAUSE", 'quit_reason_pause');

module.exports = {
  Crawler: Crawler,
  Page: Page
};

},{"./logger":17,"./retry":18}],13:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var log = require('./logger');

var KEY_CRAWLER_STATE = 'key_crawler_state';

function saveCrawler(crawler) {
  GM_setValue(KEY_CRAWLER_STATE, JSON.stringify({
    isCrawling: crawler.isCrawling,
    currUrl: crawler.currUrl,
    urlList: crawler.urlList,
    crawledUrls: _toConsumableArray(crawler.crawledUrlSet)
  }));
}

function hasUnfinishedTask() {
  var state = JSON.parse(GM_getValue(KEY_CRAWLER_STATE, null));
  log.debug("hasUnfinishedTask. state = ", state);
  return state && state.isCrawling;
}

function restoreCrawler(crawler) {
  var state = JSON.parse(GM_getValue(KEY_CRAWLER_STATE, null));
  log.debug("restoreCrawler. state = ", state);
  var urlList = state.urlList,
      currUrl = state.currUrl,
      crawledUrls = state.crawledUrls;
  var crawledUrlSet = new Set(crawledUrls);

  if (currUrl) {
    urlList.splice(0, 0, currUrl);
    crawledUrlSet["delete"](currUrl);
  }

  return crawler.restoreFromSavedState(urlList, crawledUrlSet);
}

function clearCrawler() {
  GM_deleteValue(KEY_CRAWLER_STATE);
}

module.exports = {
  saveCrawler: saveCrawler,
  clearCrawler: clearCrawler,
  hasUnfinishedTask: hasUnfinishedTask,
  restoreCrawler: restoreCrawler
};

},{"./logger":17}],14:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var db = new Dexie('ant_log');

function initSchema() {
  db.version(1).stores({
    'campaigns_log': '++,推广计划ID',
    'adgroups_log': '++,推广计划ID,推广单元ID',
    'keywords_log': '++,推广计划ID,推广单元ID,关键词'
  });
  db.version(2).stores({
    'campaigns_log': '++,推广计划ID',
    'adgroups_log': '++,推广计划ID,推广单元ID',
    'keywords_log': '++,推广计划ID,推广单元ID,关键词',
    'headers': '&table_name'
  });
}

function clear() {
  return _clear.apply(this, arguments);
}

function _clear() {
  _clear = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return db['campaigns_log'].clear();

          case 2:
            _context.next = 4;
            return db['adgroups_log'].clear();

          case 4:
            _context.next = 6;
            return db['keywords_log'].clear();

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _clear.apply(this, arguments);
}

initSchema();
module.exports = {
  db: db,
  clear: clear,
  initSchema: initSchema
};

},{}],15:[function(require,module,exports){
"use strict";

var createUrlGetter = function createUrlGetter(cssSelector) {
  var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  return function () {
    var list = [];
    var queryList = $(cssSelector);
    queryList.each(function () {
      if (filter && !filter(this)) return;
      var url = $(this).attr('href');
      if (!url) return;

      if (url.startsWith('#')) {
        list.push('' + url);
      } else if (url.startsWith('https')) {
        list.push(url);
      }
    });
    return list;
  };
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
  var fieldList = [];
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
  var dataList = [];
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
  keyArr.map(function (v, i) {
    obj[keyArr[i]] = valueArr[i];
  });
  return obj;
}

function extractDataFromTable(table) {
  var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'tr';
  var cell = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'td';
  var textExtractor = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
  var ret = [];
  $(table).find(row).each(function () {
    var row = [];
    $(this).find(cell).each(function () {
      textExtractor = textExtractor || function (ele) {
        return simplifyText($(ele).text());
      };

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

function extractDataAndSimplify(table) {
  var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'tr';
  var cell = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'td';
  return extractDataFromTable(table, row, cell);
}

function concat2DArray(left, right) {
  return left.map(function (value, index) {
    return value.concat(right[index]);
  });
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
  createUrlGetter: createUrlGetter,
  extractDataFromTable: extractDataFromTable,
  simplifyText: simplifyText,
  extractDataAndSimplify: extractDataAndSimplify,
  extractColumnsField: extractColumnsField,
  extractDataField: extractDataField,
  transformObject: transformObject,
  concat2DArray: concat2DArray,
  getParameterFromUrl: getParameterFromUrl,
  matchSiteCode: matchSiteCode,
  matchSiteCodeNew: matchSiteCodeNew
};

},{}],16:[function(require,module,exports){
'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var log = require('./logger');

var _require = require('./crawler'),
    Crawler = _require.Crawler;

var _require2 = require('./retry'),
    delayDo = _require2.delayDo;

var crawlerSaver = require('./crawlerSaver');

var WebSql = require('./WebSql');

var WebSqlObj = new WebSql();
/**
 * 描述 : 初始化配置界面
 * 作者 : LiuYun
 */

function initConfigPannel() {
  GM_config.init({
    'id': 'Taobao_Crawler_Config',
    'fields': {
      hidden1: {
        section: ['操作等待时间', '每加载一个网页后，等待一些时间，防止访问过快而被亚马逊官方察觉.'],
        type: 'hidden'
      },
      'minWait': {
        'label': '最少等待时间（秒）',
        'type': 'int',
        'default': '3'
      },
      'maxWait': {
        'label': '最长等待时间（秒）',
        'type': 'int',
        'default': '5'
      },
      hidden2: {
        'section': ['定时器配置', '配置方法请参考这里：<a href="https://bunkat.github.io/later/parsers.html#text" target=”_blank”>配置帮助</a>'],
        type: 'hidden'
      },
      'scrawlScheduleText': {
        'label': '抓取定时器配置',
        'type': 'text',
        'default': 'at 23:50 also every 1 hour between 1 and 23'
      },
      'downloadScheduleText': {
        'label': '下载定时器配置',
        'type': 'text',
        'default': 'at 23:58'
      },
      hidden3: {
        'section': ['亚马逊店铺账户配置', '当登陆状态实效时，需要重新登陆。'],
        type: 'hidden'
      },
      'taobaoAccount': {
        'label': '亚马逊店铺账户',
        'type': 'text',
        'default': ''
      },
      'taobaoPWD': {
        'label': '亚马逊店铺密码',
        'type': 'text',
        'default': ''
      },
      hidden4: {
        'section': ['文件下载根目录', '当前浏览器下载文件地址'],
        type: 'hidden'
      },
      'downloadUrl': {
        'label': '文件下载根目录',
        'type': 'text',
        'default': ''
      },
      'accountCode': {
        'label': '账号简称',
        'type': 'text',
        'default': ''
      }
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


var loginOptions = {
  loginPageURL: 'https://sellercentral.amazon.com/ap/signin?clientContext=135-8408180-7833347&openid.return_to=https%3A%2F%2Fsellercentral.amazon.com%2Fhome&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=sc_na_amazon_v2&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&ssoResponse=eyJ6aXAiOiJERUYiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiQTI1NktXIn0.AQP0A_YVXfJe489bTT7q7jR8_MOp--1fYF1g_6lQpeQ_dkvkoTKLPA.yHkRdl69ZGi5zPri.B645pEJ4Bcpm23X42QJUBxB_yqRnJCozHp2BqknS_i6j7T_whOEoJyGfTKHV7gNjMeNjh5IeHYV-V7cXJuv6mIq4afuCpqAgPTfBL0bRFsvQDlt54AdHpQJYZKIjnWdoxpsmdeaXsGTrXMCuw2mSQEuAL0KVhPFi9uVfCu32o92xCD4eoWvjKPqf2ccrKbqK0VaFud-bXyE2rf2_O2VcZf2owfmkXcCH8a7vHeNvnUFqp9s12FOYLgNbJ9-KTH8MXxwU6q7-M5Ulk7j73Vqo6Vpcy7AN5YtVCAXD.559IpeKQ1ospZwoNhgjJoQ',
  needLogin: function needLogin() {
    var mainWindow = $('#authportal-main-section > div:nth-child(2) > div > div > form').length > 0;
    var singIn = $('#authportal-main-section > div:nth-child(2) > div > div > div > div > div.a-section.auth-prompt-section > div').length > 0;
    return mainWindow || singIn;
  },
  isLoginPageReady: function isLoginPageReady() {
    return true;
  },
  isLoginSuccess: function isLoginSuccess() {
    return $('#J_LoginBox .bd').css('display') === 'none';
  },
  doLogin: function () {
    var _doLogin = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return delayDo(function () {
                var account = GM_config.get('taobaoAccount');
                $('#ap_email').val(account);
              }, 1000);

            case 2:
              _context.next = 4;
              return delayDo(function () {
                var pwd = GM_config.get('taobaoPWD');
                $('#ap_password').val(pwd);
              }, 1000);

            case 4:
              _context.next = 6;
              return delayDo(function () {
                log.debug('doLogin. submit');
                $('#signInSubmit').click();
              }, 2000);

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function doLogin() {
      return _doLogin.apply(this, arguments);
    }

    return doLogin;
  }()
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
  var intoPageJsPage = '';

  switch (intoPageJs) {
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

  var options = {
    startPageURL: 'https://sellercentral.amazon.com/home',
    minWait: (GM_config.get('minWait') || 3) * 1000,
    maxWait: (GM_config.get('maxWait') || 5) * 1000,
    gotoUrl: function () {
      var _gotoUrl = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                location.href = url;

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function gotoUrl(_x) {
        return _gotoUrl.apply(this, arguments);
      }

      return gotoUrl;
    }(),
    pageList: [new intoPageJsPage()],
    login: loginOptions,
    onPageStart: function onPageStart() {
      crawlerSaver.saveCrawler(currRunningCrawler);
    },
    onCrawlComplete: function onCrawlComplete() {
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
  var options = createCrawlerOptions(intoPageJs);
  var pageList = options.pageList;
  var url = window.location.href;
  var newPageList = pageList.filter(function (p) {
    return p.triggerOnUrl(url);
  });
  console.log(newPageList);
  newPageList.forEach(function (p) {
    p.findNewUrl = false;

    p.onDataFrameReady = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(fileName, newFileName, dataFrame) {
        var workbook, data, option, sheet;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (dataFrame instanceof Object) {
                  workbook = XLSX.utils.book_new();
                  data = dataFrame.toCollection();
                  option = undefined;
                  sheet = XLSX.utils.json_to_sheet(data, option);
                  XLSX.utils.book_append_sheet(workbook, sheet, p.id);
                  XLSX.writeFile(workbook, fileName);
                }

                if (typeof fileName === 'string' && fileName !== '') {
                  options.fileName = fileName;
                }

                if (typeof newFileName === 'string' && newFileName !== '') {
                  options.newFileName = newFileName;
                }

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function (_x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      };
    }();
  });
  options.pageList = newPageList;
  options.startPageURL = url;

  options.onPageStart = function () {};

  options.onCrawlComplete = function () {
    if (options.fileName) {
      var pathName = GM_config.get('downloadUrl') + "/" + options.fileName;
      sendFileNow(pathName, options.newFileName);
    } //读取数据


    var readData = WebSqlObj.read('yafex', '');
    readData.then(function (getDate) {
      //通过读取的数据得到当前页面链接
      var readUrl = '';

      if (getDate && getDate.length == 1) {
        readUrl = getDate[0];
      } else {
        getDate.forEach(function (d) {
          if (d.currentPage == 'true') {
            readUrl = d;
          }
        });
      }

      if (!readUrl.name) {
        return false;
      } //通过当前页面链接更改当前数据状态


      console.log("false=====" + readUrl.name);
      var updateDate = WebSqlObj.update('yafex', 'name', readUrl.name, {
        'status': '1',
        'currentPage': 'false'
      });
      updateDate.then(function () {
        //向字节点查找数据
        var result = WebSqlObj.getChildUrlByPurl("yafex", readUrl.url);
        result.then(function (data) {
          var newdata = [];

          if (data && data.length != 0) {
            data.forEach(function (v, i) {
              if (v.status == 0) {
                newdata.push(v);
              }
            });

            if (newdata && newdata.length != 0) {
              console.log("true=====" + newdata[0].name);
              var updateCurrentPage = WebSqlObj.update('yafex', 'name', newdata[0].name, {
                'currentPage': 'true'
              });
              updateCurrentPage.then(function () {
                var localObj = WebSqlObj.read('yafex', '');
                localObj.then(function (localData) {
                  if (newdata[0].url == 'domClick') {
                    $('#J_Button_NORMAL_ENABLED').click();
                    setTimeout(function () {
                      crawlCurrPage();
                    }, 11000);
                  } else {
                    var tempwindow = window.open();
                    tempwindow.location = newdata[0].url;
                    setTimeout(function () {
                      window.pener = null;
                      window.open("about:blank", "_self");
                      window.close();
                    }, 11000);
                  }
                });
              });
            }
          } else {
            var resultUrl = WebSqlObj.getPrentUrlByUrl("yafex", readUrl.purl);
            resultUrl.then(function (dataUrl) {
              var resultUrlNew = [];
              dataUrl.forEach(function (v, i) {
                if (v.status == 0) {
                  resultUrlNew.push(v);
                }
              });

              if (resultUrlNew && resultUrlNew.length != 0) {
                console.log("true=====" + resultUrlNew[0].name);

                var _updateCurrentPage = WebSqlObj.update('yafex', 'name', resultUrlNew[0].name, {
                  'currentPage': 'true'
                });

                _updateCurrentPage.then(function () {
                  var localObj = WebSqlObj.read('yafex', '');
                  localObj.then(function (localData) {
                    if (resultUrlNew[0].url == 'domClick') {
                      $('#J_Button_NORMAL_ENABLED').click();
                      setTimeout(function () {
                        crawlCurrPage();
                      }, 11000);
                    } else {
                      var tempwindow = window.open();
                      tempwindow.location = resultUrlNew[0].url;
                      setTimeout(function () {
                        window.pener = null;
                        window.open("about:blank", "_self");
                        window.close();
                      }, 11000);
                    }
                  });
                });
              } else {
                WebSqlObj.read('yafex', 'where level="0"').then(function (dataLevel) {
                  if (dataLevel && dataLevel.length != 0) {
                    var resultLevel = WebSqlObj.getChildUrlByPurl("yafex", dataLevel[0].url);
                    var levelNew = [];
                    resultLevel.then(function (leveldata) {
                      leveldata.forEach(function (v, i) {
                        if (v.status == '0') {
                          levelNew.push(v);
                        }
                      });

                      if (levelNew && levelNew.length != 0) {
                        console.log("true=====" + levelNew[0].name); //兼容老页面数据完整

                        if (levelNew[0].name === 'AdvertisingReports' && levelNew[0].level == '1') {
                          var levelCurrentPage = WebSqlObj.update('yafex', 'name', levelNew[0].name, {
                            'status': '1'
                          });
                        } else {
                          var levelCurrentPage = WebSqlObj.update('yafex', 'name', levelNew[0].name, {
                            'currentPage': 'true'
                          });
                        }

                        levelCurrentPage.then(function () {
                          var localObj = WebSqlObj.read('yafex', '');
                          localObj.then(function (localData) {
                            if (levelNew[0].url == 'domClick') {
                              $('#J_Button_NORMAL_ENABLED').click();
                              setTimeout(function () {
                                crawlCurrPage();
                              }, 11000);
                            } else {
                              var tempwindow = window.open();
                              tempwindow.location = levelNew[0].url;
                              setTimeout(function () {
                                window.pener = null;
                                window.open("about:blank", "_self");
                                window.close();
                              }, 11000);
                            }
                          });
                        });
                      } else {
                        console.log('daodile' + '测试失败了');
                      }
                    });
                  }
                });
              }
            });
          }
        });
      });
    });
  };

  return new Crawler(options);
}
/**
 * 描述 : 初始化页面爬虫
 * 作者 : LiuYun
 */


function crawlCurrPage() {
  var adUrl = window.location.href.split('?')[0]; //描述 : 如是首页或 advertising.amazon.com 域，则将websql数据清空

  if (window.location.href == 'https://sellercentral.amazon.com/home?ref_=xx_swlang_head_xx&mons_sel_locale=en_US&languageSwitched=1' || window.location.href == 'https://sellercentral.amazon.com/home?ref_=xx_swlang_head_xx&mons_sel_locale=en_US&languageSwitched=1&' || adUrl == 'https://advertising.amazon.com/sspa/tresah/ref=xx_perftime_dnav_xx') {
    var delTable = WebSqlObj.delTable("yafex");
  } //索评页面不加载


  if (adUrl == 'https://sellercentral.amazon.com/messaging/reviews') {
    console.log('索评页面不加载');
    return false;
  } //交易报表页面不加载


  if (adUrl == 'https://sellercentral.amazon.com/payments/reports/custom/request') {
    console.log('交易报表页面不加载');
    return false;
  } //重置页面不需要刷新


  localStorage.setItem("refreshFlag", 'no');
  localStorage.setItem("refreshNum", 0); //描述 : 获取websql数据

  var resultRead = WebSqlObj.read("yafex", "");
  resultRead.then(function (resultData) {
    if (!resultData || resultData.length == 0) {
      var row = [{
        "name": 'Sellercentral',
        "url": window.location.href,
        "purl": '',
        "level": '0',
        "status": '0',
        "errStatus": '0',
        "currentPage": 'true'
      }];

      if (adUrl == 'https://advertising.amazon.com/sspa/tresah/ref=xx_perftime_dnav_xx') {
        row[0].name = 'AdvertisingReports';
      }

      var result = WebSqlObj.add("yafex", row);
      result.then(function (data) {
        if (data) {
          var intoPageJs = './' + row['0'].name + '.js';
          var crawler = createOnePageCrawler(intoPageJs);
          crawler.start();
        }
      });
    } else {
      resultData.forEach(function (data) {
        if (data.currentPage == 'true') {
          var intoPageJs = './' + data.name.split('_')[0] + '.js';
          console.log(intoPageJs);
          var crawler = createOnePageCrawler(intoPageJs);
          crawler.start();
        }
      });
    }
  });
}
/**
 * 描述 : 发送本地网络请求
 * 作者 : Y.X.chen
 */


function sendFileNow() {
  var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var newFile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var newFileType = typeof newFile === 'string' && newFile !== '' ? "&newfile=" + newFile : ''; //延迟5秒通知上传

  setTimeout(function () {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://127.0.0.1:9001/upload/?path=" + file + newFileType,
      onload: function onload(res) {
        if (res.status === 200) {
          log.debug('_dow: dowSuccess:', res.statusText); //设置上传文件成功缓存

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

            for (var i = 8; i >= 2; i--) {
              var timeObj = new Date(dateObj.getTime() - i * 24 * 60 * 60 * 1000);
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
            $.each(advDayReportArr, function (k, v) {
              if (needAdvDay.includes(v)) {
                oneAdvDayList.push(v);
              }
            });
            var dayEq = newFile.split('_')[3];

            if (dayEq) {
              var timeObj = new Date(dateObj.getTime() - dayEq * 24 * 60 * 60 * 1000);
              var addDate = timeObj.getMonth() + 1 + "-" + timeObj.getDate();
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


var GMMenus = [{
  name: '仅抓取此页',
  fn: crawlCurrPage,
  accessKey: 'curr'
}, {
  name: '爬虫配置',
  fn: function fn() {
    return GM_config.open();
  },
  accessKey: 'config'
}];
/**
 * 描述 : 配置界面
 * 作者 : LiuYun
 */

GMMenus.forEach(function (m) {
  GM_registerMenuCommand(m.name, m.fn, m.accessKey);
});
/**
 * 临时运行调度器
 */

var currRunningCrawler = null;
/**
 * 描述 : 监听当前窗口页面加载完毕之后执行一下事件
 * 注明 : 首先初始化配置页面
 * 作者 : LiuYun
 */

window.onload = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
  return regeneratorRuntime.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          initConfigPannel();
          later.date.localTime();

          if (window.top == window.self) {
            //判断是否需要登录
            if (loginOptions.needLogin()) {
              log.debug("login");
              loginOptions.doLogin();
            } else {
              log.debug("nologin");
            }

            setTimeout(function () {
              //控制adv报表英文模式下载
              if (location.href == 'https://advertising.amazon.com/cm/campaigns?languageSwitched=1&mons_sel_locale=en_US&ref_=xx_swlang_head_xx' && $("input[name=aac-select-language]:checked").val() != 'en_US') {
                console.log('into'); // $("#aac-select-language-en_US").click();

                var e = document.createEvent('MouseEvents');
                e.initEvent("click", true, true);
                document.getElementById("aac-select-language-en_US").dispatchEvent(e);
              } //调用初始化页面规则


              crawlCurrPage();
            }, 5000);
          }

        case 3:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
}));

},{"./AdvertisingReports.js":1,"./BusinessReports.js":2,"./BusinessReportsPages.js":3,"./CampaignsList.js":4,"./NewReport1.js":5,"./NewReport3.js":6,"./RunReport1.js":7,"./RunReport3.js":8,"./Sellercentral.js":9,"./WebSql":10,"./advDayReport.js":11,"./crawler":12,"./crawlerSaver":13,"./logger":17,"./retry":18,"./runAdvDayReport.js":19}],17:[function(require,module,exports){
"use strict";

var createLog = function createLog(fn) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return fn.apply(void 0, ["[ ==== ".concat(moment().format('YYYY-MM-DD HH:mm:ss'), " ==== ]")].concat(args));
  };
};

var log = {
  debug: createLog(console.log),
  log: createLog(console.log),
  trace: createLog(console.trace),
  info: createLog(console.info),
  warn: createLog(console.warn),
  error: createLog(console.error)
};
module.exports = log;

},{}],18:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var log = require('./logger');

function retry(_x) {
  return _retry.apply(this, arguments);
}

function _retry() {
  _retry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fn) {
    var count,
        interval,
        retriesLeft,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            count = _args.length > 1 && _args[1] !== undefined ? _args[1] : 5;
            interval = _args.length > 2 && _args[2] !== undefined ? _args[2] : 1000;
            retriesLeft = count;
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              fn().then(resolve)["catch"](function (error) {
                setTimeout(function () {
                  if (retriesLeft <= 1) {
                    // reject('maximum retries exceeded');
                    reject(error);
                  } else {
                    retry(fn, retriesLeft - 1, interval).then(resolve, reject);
                  } // Passing on "reject" is the important part

                }, interval);
              });
            }));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _retry.apply(this, arguments);
}

function check(_x2) {
  return _check.apply(this, arguments);
}

function _check() {
  _check = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(fn) {
    var count,
        interval,
        _args2 = arguments;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            count = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : 5;
            interval = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : 1000;
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              var retryLeft = count;
              var timerID = setInterval(function () {
                log.debug('check: retryLeft:', retryLeft);

                if (fn()) {
                  clearInterval(timerID);
                  resolve();
                  return;
                }

                retryLeft--;

                if (retryLeft <= 0) {
                  clearInterval(timerID);
                  reject();
                }
              }, interval);
            }));

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _check.apply(this, arguments);
}

function waitUntil(_x3) {
  return _waitUntil.apply(this, arguments);
}

function _waitUntil() {
  _waitUntil = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(fn) {
    var maxWait,
        interval,
        _args3 = arguments;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            maxWait = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : 10000;
            interval = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : 1000;
            return _context3.abrupt("return", check(fn, Math.ceil(maxWait / interval), interval));

          case 3:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _waitUntil.apply(this, arguments);
}

function delayDo(_x4) {
  return _delayDo.apply(this, arguments);
}

function _delayDo() {
  _delayDo = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(fn) {
    var delay,
        _args4 = arguments;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            delay = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : 1000;
            return _context4.abrupt("return", new Promise(function (resolve, _) {
              setTimeout(function () {
                fn();
                resolve();
              }, delay);
            }));

          case 2:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _delayDo.apply(this, arguments);
}

module.exports = {
  retry: retry,
  check: check,
  waitUntil: waitUntil,
  delayDo: delayDo
};

},{"./logger":17}],19:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DataFrame = dfjs.DataFrame;

var _require = require('./helper'),
    createUrlGetter = _require.createUrlGetter,
    matchSiteCodeNew = _require.matchSiteCodeNew;

var log = require('./logger');

var anchorFilter = function anchorFilter(ele) {
  /** 暂停状态，不抓取 */
  return $(ele).closest('tr').find('span.status-0').length <= 0;
};

var newUrlsGetter = createUrlGetter('#report_DetailSalesTrafficByChildItem', anchorFilter);

var runAdvDayReport =
/**
 * 描述 : 构造初始化
 * 作者 : LiuYun
 */
function runAdvDayReport() {
  var _this = this;

  _classCallCheck(this, runAdvDayReport);

  _defineProperty(this, "id", 'runAdvDayReport');

  _defineProperty(this, "onPageReady", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fetchSN) {
      var data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              data = _this.parseData(fetchSN);

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "triggerOnUrl", function (url) {
    return !!url && !!url.match(/(http:\/\/advertising.amazon.com)?\/(.*)/);
  });

  _defineProperty(this, "getUrlsToAdd", function () {
    return _this.findNewUrl ? newUrlsGetter() : [];
  });

  _defineProperty(this, "isPageReady", function () {
    var ret = $('#devingPaging > tbody.of-paging_body > tr').length > 0;
    log.debug('isPageReady:', ret);
    return ret;
  });

  _defineProperty(this, "saveData", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataFrame) {
      var _require2, db;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _require2 = require('./db'), db = _require2.db;
              _context2.next = 3;
              return db['campaigns_log'].bulkPut(dataFrame.toCollection());

            case 3:
              _context2.next = 5;
              return db['headers'].put({
                table_name: 'campaigns_log',
                'columns': dataFrame.listColumns()
              });

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  _defineProperty(this, "parseData", function (fetchSN) {
    var WebSql = require('./WebSql.js');

    var WebSqlObj = new WebSql();
    var readData = WebSqlObj.read('yafex', 'where currentPage = "true"');
    readData.then(function (getDate) {
      var beforeDay = '';

      if (getDate && getDate.length != 0) {
        beforeDay = getDate[0].name.split('_')[1];
      }

      console.log(beforeDay);
      $("#page-size-dropdown > label > button").click();
      setTimeout(function () {
        $("#portal > div > div > button:nth-child(1)").click();
        setTimeout(function () {
          $('.rt-table .rt-tbody>.rt-tr-group .rt-tr').each(function () {
            if ($(this).find('p.sc-fzqARJ').eq(0).text() == 'Completed') {
              $(this).find('a span.sc-fzpisO').trigger('click');
              return false;
            }
          });
        }, 500);
      }, 500);
      var data = {};
      var date = new Date();
      var hourTime = date.getHours();

      if (hourTime < 15) {
        date.setTime(date.getTime() - 86400000);
      }

      var accountCode = GM_config.get('accountCode');
      var siteCode = matchSiteCodeNew($.trim($("#AACChromeHeaderAccountDropdown > button > div:nth-child(2)").text()));
      var fileName = 'Sponsored Products Advertised product report';
      data['fileName'] = fileName !== '' ? fileName + ".xlsx" : fileName;
      data['newFileName'] = 'advProductReport_' + accountCode + '_' + siteCode + '_' + beforeDay + '_' + moment().format('YYYYMMDDHHmmss');

      _this.onDataFrameReady(data.fileName, data.newFileName, null);
    });
  });

  this.findNewUrl = true;
  this.onDataFrameReady = this.saveData;
};

module.exports = runAdvDayReport;

},{"./WebSql.js":10,"./db":14,"./helper":15,"./logger":17}]},{},[16]);
