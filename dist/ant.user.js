// ==UserScript==
// @name         爬取亚马逊店铺后台数据
// @version      0.2.9
// @author       LiuYun
// @description  这是一个爬取亚马逊店铺后台有效数据的一个功能强大的脚本。
// @match        *.sellercentral.amazon.com/*
// @homePage     https://gitee.com/liuliangyun/Tampermonkey
// @license      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @copyright    2020, LiuYun
// @run-at       document-idle
// @require      http://intelligence.dev.yafex.cn/view/crawler/config/GM_config.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.slim.min.js
// @require      http://intelligence.dev.yafex.cn/view/crawler/extend/dataframe.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/dexie/2.0.4/dexie.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.15.5/xlsx.full.min.js
// @require      http://intelligence.dev.yafex.cn/view/crawler/extend/later.min.js
// @grant             unsafeWindow
// @grant             GM_xmlhttpRequest
// @grant             GM_setClipboard
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             GM_deleteValue
// @grant             GM_openInTab
// @grant             GM_registerMenuCommand
// @grant             GM_unregisterMenuCommand
// @require      http://intelligence.dev.yafex.cn/view/crawler/dist/min.js
// ==/UserScript==