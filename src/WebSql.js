const log = require('./logger');

class WebSql {
    constructor(options) {
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
    init() {
        this.database = openDatabase(
            this.DateBaseName,
            this.Version,
            this.Description,
            this.DataBaseSize
        );
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
    addBlob(tableName, arr, index, isFirst = true) {

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
                        tx.executeSql(
                            'CREATE TABLE IF NOT EXISTS ' +
                            tableName +
                            ' (' +
                            keyC.join(',') +
                            ')'
                        );
                        console.log('CREATE TABLE IF NOT EXISTS ' +
                            tableName +
                            ' (' +
                            keyC.join(',') +
                            ')');
                    }
                    for (var s = 0, _len = arr.length; s < _len; s++) {
                        var _value = _me.split(arr[s]);
                        tx.executeSql(
                            'INSERT INTO ' +
                            tableName +
                            ' (' +
                            _key +
                            ') VALUES (' +
                            _value +
                            ')',
                            [],
                            function (tx, result) {
                                resovle(result.rowsAffected);
                                log.debug('添加成功:', result.rowsAffected);
                            },
                            function (tx) {
                                log.debug('添加失败:');
                                reject(false);
                            }
                        );
                    }
                    _key = keyI = keyC = null;
                    resovle(arr.length);
                });
            }
        }).catch(error => {
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
    patchAddBlob(tableName, arr, index, firstKey = true, isFirst = true) {
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
                        tx.executeSql(
                            'CREATE TABLE IF NOT EXISTS ' +
                            tableName +
                            ' (' +
                            keyC.join(',') +
                            ')'
                        );
                    }
                    var sql = '';
                    var _values = [];
                    for (var s = 0, _len = arr.length; s < _len; s++) {
                        _values.push('(' + _me.split(arr[s]) + ')');
                    }
                    sql =
                        'INSERT INTO ' +
                        tableName +
                        ' (' +
                        _key +
                        ') VALUES ' +
                        _values.join(',');
                    tx.executeSql(
                        sql,
                        [],
                        function (tx, result) {
                            resovle(result.rowsAffected);
                        },
                        function (tx, error) {
                            log.debug('添加失败:', tx + error);
                            reject(false);
                        }
                    );
                    _key = keyI = keyC = null;
                    resovle(arr.length);
                });
            }
        }).catch(error => {
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
    add(tableName, arr, firstKey = true) {
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
                // console.log(keyI);
                // console.log(keyC);
                if (firstKey) {
                    keyC[0] = keyC[0] + ' unique';
                }
                _key = keyI.join(',');
                _db.transaction(function (tx) {
                    tx.executeSql(
                        'CREATE TABLE IF NOT EXISTS ' +
                        tableName +
                        ' (' +
                        keyC.join(',') +
                        ')'
                    );
                    // console.log('CREATE TABLE IF NOT EXISTS ' +
                    //     tableName +
                    //     ' (' +
                    //     keyC.join(',') +
                    //     ')');
                    for (var s = 0, _len = arr.length; s < _len; s++) {
                        var _value = _me.split(arr[s]);
                        tx.executeSql(
                            'INSERT INTO ' +
                            tableName +
                            ' (' +
                            _key +
                            ') VALUES (' +
                            _value +
                            ')',
                            [],
                            function (tx, result) {
                                resovle(result.rowsAffected);

                            },
                            function (tx, error) {
                                log.debug('添加失败:', error);
                                reject(false);
                            }
                        );
                    }
                    _key = keyI = keyC = null;
                    resovle(arr.length);
                });
            }
        }).catch(error => {
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
    patchAdd(tableName, arr, firstKey = true) {
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
                    tx.executeSql(
                        'CREATE TABLE IF NOT EXISTS ' +
                        tableName +
                        ' (' +
                        keyC.join(',') +
                        ')'
                    );
                    var sql = '';
                    var _values = [];
                    for (var s = 0, _len = arr.length; s < _len; s++) {
                        _values.push('(' + _me.split(arr[s]) + ')');
                    }
                    sql =
                        'INSERT INTO ' +
                        tableName +
                        ' (' +
                        _key +
                        ') VALUES ' +
                        _values.join(',');
                    console.log('sql:' + sql);
                    tx.executeSql(
                        sql,
                        [],
                        function (tx, result) {
                            resovle(result.rowsAffected);
                        },
                        function (tx, error) {
                            log.debug('添加失败:', error);
                            reject(false);
                        }
                    );
                    _key = keyI = keyC = null;
                    resovle(arr.length);
                });
            }
        }).catch(error => {
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
    update(tableName, key, value, obj) {
        var _db = this.database;
        var _value = this.splitU(obj);
        return new Promise(function (resovle, reject) {
            _db.transaction(function (tx) {
                tx.executeSql(
                    'UPDATE ' +
                    tableName +
                    ' set ' +
                    _value +
                    ' where ' +
                    key +
                    '="' +
                    value +
                    '"',
                    [],
                    function (tx, result) {
                        resovle(result.rowsAffected);
                    },
                    function (tx, error) {
                        log.debug('添加失败:', error);
                        reject(false);
                    }
                );
            });
        }).catch(error => {
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
    updateWhere(tableName, condition, obj) {
        var _db = this.database;
        var _value = this.splitU(obj);
        return new Promise(function (resovle, reject) {
            _db.transaction(function (tx) {
                console.log('UPDATE ' + tableName + ' set ' + _value + ' ' + condition);
                tx.executeSql(
                    'UPDATE ' + tableName + ' set ' + _value + +' ' + condition,
                    [],
                    function (tx, result) {
                        resovle(result.rowsAffected);
                    },
                    function (tx, error) {
                        log.debug('添加失败:', error);
                        reject(false);
                    }
                );
            });
        }).catch(error => {
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
    read(tableName, condition) {
        var _db = this.database;
        var _me = this;
        return new Promise(function (resovle, reject) {
            var _condition = _me.isString(condition) ? condition : '';
            var _re = [];
            _db.transaction(function (tx) {
                tx.executeSql(
                    'SELECT * FROM ' + tableName + ' ' + _condition + ' ',
                    [],
                    function (tx, results) {
                        if (results && results.rows) {
                            _re = _me.toArray(results.rows);
                            resovle(_re);
                        } else {
                            resovle([]);
                        }
                    },
                    function (tx, error) {
                        reject([]);
                        log.debug('添加失败:', error);
                    }
                );
            });
        }).catch(error => {
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
    readField(tableName, field = '*', condition) {
        var _db = this.database;
        var _me = this;
        return new Promise(function (resovle, reject) {
            var _condition = _me.isString(condition) ? condition : '';
            var _re = [];
            _db.transaction(function (tx) {
                tx.executeSql(
                    'SELECT ' + field + ' FROM ' + tableName + ' ' + _condition + ' ',
                    [],
                    function (tx, results) {
                        if (results && results.rows) {
                            _re = _me.toArray(results.rows);
                            resovle(_re);
                        } else {
                            resovle([]);
                        }
                    },
                    function (tx, error) {
                        reject([]);
                        log.debug('添加失败:', error);
                    }
                );
            });
        }).catch(error => {
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
    remove(tableName, condition) {
        var _me = this;
        var _condition = _me.isString(condition) ? condition : '';
        return new Promise(function (resovle, reject) {
            _me.database.transaction(function (tx) {
                tx.executeSql(
                    'DELETE FROM ' + tableName + ' ' + _condition + ' ',
                    [],
                    function (tx, result) {
                        resovle(result.rowsAffected);
                    },
                    function (tx, error) {
                        reject(false);
                        log.debug('删除失败:', error);
                    }
                );
            });
        }).catch(error => {
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
    counts(tableName, condition) {
        try {
            if (browserVersions.android) {
                return this.androidCounts(tableName, condition);
            } else {
                return this.iosCounts(tableName, condition);
            }
        } catch {
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
    iosCounts(tableName, condition) {
        var _db = this.database;
        var _me = this;
        var _condition = _me.isString(condition) ? condition : '';
        return new Promise(function (resovle, reject) {
            var _re = [];
            _db.transaction(function (tx) {
                tx.executeSql(
                    'SELECT 1 FROM ' + tableName + ' ' + _condition + ' ',
                    [],
                    function (tx, results) {
                        if (results && results.rows) {
                            _re = _me.toArray(results.rows);
                            resovle(_re.length);
                        } else {
                            resovle(0);
                        }
                    },
                    function (tx, error) {
                        reject(0);
                        log.debug('查询失败:', error);
                    }
                );
            });
        }).catch(e => {
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
    androidCounts(tableName, condition) {
        var _db = this.database;
        var _me = this;
        var _condition = _me.isString(condition) ? condition : '';
        return new Promise(function (resovle, reject) {
            var _re = [];
            _db.transaction(function (tx) {
                tx.executeSql(
                    'SELECT count (*) as num FROM ' + tableName + ' ' + _condition + ' ',
                    [],
                    function (tx, results) {
                        if (results && results.rows) {
                            if (results.rows[0]) {
                                resovle(results.rows[0].num);
                            } else {
                                resovle(0);
                            }
                        } else {
                            resovle(0);
                        }
                    },
                    function (tx, error) {
                        reject(0);
                        log.debug('查询失败:', error);
                    }
                );
            });
        }).catch(e => {
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
    delTable(tableName) {
        var _db = this.database;
        console.log('_db :', _db);
        return new Promise(function (resovle, reject) {
            _db.transaction(function (tx) {
                tx.executeSql(
                    'DROP TABLE IF EXISTS ' + tableName,
                    [],
                    function (tx, res) {
                        resovle(1);
                    },
                    function (tx, err) {
                        log.debug('删除数据表失败:', err);
                        reject(0);
                    }
                );
            });
        });
    }

    /**
     * 描述 : 更新字符处理
     * 作者 : LiuYun
     */
    splitU(obj) {
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
    split(obj) {
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
    isFunction(callback) {
        return !!(
            typeof callback != 'undefined' && callback.constructor == Function
        );
    }

    /**
     * 描述 : 是否是字符串
     * 作者 : LiuYun
     */
    isString(string) {
        return typeof string == 'string';
    }

    /**
     * 描述 : 对象转化为数组
     * 作者 : LiuYun
     */
    toArray(obj) {
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
    getChildUrlByPurl(table, url) {
        //新增数据
        let result = this.read(table, 'where purl="' + url + '"');
        let newResult = [];
        const that = this;
        return new Promise(function (resovle, reject) {
            result.then(function (result) {
                if (Object.keys(result).length !== 0) {
                    // result.forEach(function (v) {
                    //     newResult[v['url']] = v;
                    // });
                    newResult = result;
                    resovle(newResult)
                } else {
                    resovle([])
                }
                // if (Object.keys(newResult).length !== 0) {
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
            }).catch(error => {
                reject([]);
                console.log('查询失败 :', error);

            });
        }).catch(error => {
            console.log('生成失败 :', error);
        });
    }

    /**
     * 描述 : 根据当前url查找对应的上级url
     * 作者 : LiuYun
     */
    getPrentUrlByUrl(table,url) {
        //新增数据
        let result = this.read(table, 'where url="' + url + '"');
        let newResult = [];
        const that = this;
        return new Promise(function (resovle, reject) {
            result.then(function (result) {
                if (Object.keys(result).length !== 0) {
                    // result.forEach(function (v) {
                    //     newResult[v['url']] = v;
                    // });
                    newResult = result;
                    resovle(newResult)
                } else {
                    resovle([])
                }
                // if (Object.keys(newResult).length !== 0) {
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
            }).catch(error => {
                reject([]);
                console.log('查询失败 :', error);

            });
        }).catch(error => {
            console.log('生成失败 :', error);
        });
    }
}

module.exports = WebSql;