// This Utility Object is used to manage an object's caching and disk persistence.

var async = require('async');
var LogManager = require('./LogManager');

TTL_LOCK = 10;
TTL_ONE_DAY = 86400;
TTL_THREE_DAYS = 259200;
KEY_CACHE = 'cache';
KEY_DISK = 'disk';

/**
 * Check memcached first, if it's in memcached, return that.
 * If not, check dynamodb. If it's there, copy to memcached, then return.
 * If not in dynamodb, return null for data.
 *
 * We're storing in memcached using the value as the key
 * whereas in dynamodb, we need to use the primary key and the value.
 *
 * TODO: refactor this to separately use the cache and db retrieval methods.
 *
 * @param value     The string value to store with the given key.
 * @param key       The primary key.
 * @param table     The database table for which to look
 * @param callback  should accept ( err, data ) as params. returns null data if complete miss.
 */
var getItemWithKeyInTable = function( key, table, callback ) {
    // first check memcached
    var start = new Date().getTime();
    key = key.toString(); //defensive programming
    var memcachedKey = getMemcachedKey( table, key );
    app_memcached.get( memcachedKey, function(err, memData){
            if( err ) {
                var message = "Table causing error: " + table;
                LogManager.logError( message, err );
            } else if( memData ) { // memcached hit
                var current = new Date().getTime();
                var elapsed = current - start;
                callback( err, memData );
            } else {
                // if no memcached hit, check dynamodb
                var keyObj = {};
                keyObj['key'] = {
                    'S' : key
                };
                dynamodb.getItem( {
                    TableName: table,
                    Key: keyObj
                }, function( err, dynData ) {
                    if( err ) {
                        var message = "Table causing error: " + table;
                        LogManager.logError( message, err );
                    }
                    if( dynData && dynData.Item && dynData.Item['key'] && dynData.Item['key']['S'] ) { // dynamodb hit
                        var elapsed = new Date().getTime() - start;
                        var value = dynData.Item['value']['S'];
                        // put in memcached
                        app_memcached.set( memcachedKey, value, TTL_ONE_DAY, function(err, memData2) {
                            if( err ) {
                                var message = "Table causing error: " + table;
                                LogManager.logError( message, err );
                            }
                        });

                        callback( err, value );
                    } else {
                        // if no dynamodb hit, return null
                        callback( err, null );
                    }
                });
            }
        }
    );
};
module.exports.getItemWithKeyInTable = getItemWithKeyInTable;

// TODO : this should use memcached.getMulti and the corresponding dynamodb call
module.exports.getMultiWithKeysInTable = function( keys, table, callback ) {
    var result = {};
    async.forEach(keys, function( key, callback ) {
        module.exports.getItemWithKeyInTable( key, table, function( err, data ) {
            if( err ) {
                var message = "Table causing error: " + table;
                LogManager.logError( message, err );
                result[key] = null;
            } else {
                try {
                    result[key] = JSON.parse( data );
                } catch( e ) {
                    if(typeof data == 'string') {
                        result[key] = data;
                    } else {
                        console.log( "Table causing error: " + table);
                        console.log( "Error : DataManager : " + e.toString() );
                    }
                }
            }
            callback();
        });
    }, function(err) {
        callback( err, err ? null : result );
    });
};

module.exports.putMultiWithKeysInTable = function( values, keys, table, callback ) {
    var result = {};
    async.forEach(keys, function( key, callback ) {
        module.exports.putValueForKeyInTable( values[key], key, table, function( err, data ) {
            if( err ) {
                var message = "Table causing error: " + table;
                LogManager.logError( message, err );
                result[key] = null;
            } else {
                result[key] = data;
            }
            callback();
        });
    }, function(err) {
        callback( err, err ? null : result);
    });
};

/**
 * Puts an item into cache and onto disk.
 * Returns the respective data from both under their respective keys.
 *
 * TODO: refactor this to utilize the cache and db put methods
 *
 * @param value   String value to store.
 * @param key     String key for lookup
 * @param table   Table to store the key:value in.
 * @param callback
 */
var putValueForKeyInTable = function( value, key, table, mainCallback ) {
    var result = {};
    async.parallel([
        function( callback ) {
            var memcachedKey = getMemcachedKey( table, key );
            app_memcached.set( memcachedKey, value, TTL_ONE_DAY, function( err, memReturnData ) {
                if(err){
                    var message = "Table causing error: " + table;
                    LogManager.logError( message, err );
                    callback(err);
                } else {
                    result[KEY_CACHE] = memReturnData;
                    callback();
                }
            });
        },
        function( callback ){
            var itemObj = {};
            itemObj['key'] = {
                'S' : key
            };
            itemObj['value'] = {
                'S' :  value
            };
            dynamodb.putItem({
                TableName: table,
                Item: itemObj,
                ReturnValues: "ALL_OLD"
            }, function( err, dynReturnData ) {
                if( err ){
                    console.log( "Error : DataManager : " + err );
                    console.log( "Table causing error: " + table);
                    callback( err );
                } else {
                    result[KEY_DISK] = dynReturnData;
                    if( callback )
                        callback();
                }
            });
        }
    ], function( err ){
        try {
            if(mainCallback) {
                mainCallback( err, result );
            }
        } catch( err ) {
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
        }
    });
};
module.exports.putValueForKeyInTable = putValueForKeyInTable;

/**
 * Retrieves an item from the database without looking in the cache,
 * or caching it upon retrieval.
 *
 * @param key
 * @param table
 * @param callback
 */
module.exports.getItemWithKeyInTableNoCache = function( key, table, callback ) {
    var start = new Date().getTime();
    var keyObj = {};
    keyObj['key'] = {
        'S' : key
    };
    dynamodb.getItem( {
        TableName: table,
        Key: keyObj
    }, function( err, dynData ) {
        if( err ) {
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
        }
        if( dynData && dynData.Item && dynData.Item['key'] && dynData.Item['key']['S'] ) { // dynamodb hit
            var elapsed = new Date().getTime() - start;
            //console.log( 'get '+key+' : ' + elapsed.toString() );
            var value = dynData.Item['value']['S'];
            callback( err, value );
        } else {
            //console.log( 'missed item' );
            // if no dynamodb hit, return null
            callback( err, null );
        }
    });
}

/**
 * Retrieves an item from the cache without falling back to look at the database.
 *
 * @param key
 * @param table
 * @param callback
 */
module.exports.getItemWithKeyInTableFromCache = function( key, table, callback ) {
//    var start = new Date().getTime();
    var memcachedKey = getMemcachedKey( table, key );
    app_memcached.get( memcachedKey, function(err, memData){
        if( err ) {
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
            callback( err, null );
        } else if( memData ) { // memcached hit
//            var current = new Date().getTime();
//            var elapsed = current - start;
//            console.log( 'get '+key+' : ' + elapsed.toString() );
            callback( null, memData );
        } else {
            callback( null, false );
        }
    });
}

/**
 * Puts an item into the database without caching the item.
 *
 * @param value
 * @param key
 * @param table
 * @param callback
 */
module.exports.putValueForKeyInTableNoCache = function( value, key, table, callback ) {
    putValueWithTypeForKeyInTable( value, 'S', key, table, callback );
}

/**
 * Puts an item into the cache without putting it into the db.
 *
 * @param value
 * @param key
 * @param table
 * @param ttl   Time for the data to live.
 * @param callback
 */
module.exports.putValueForKeyInCache = function( value, key, table, ttl, callback ) {
    ttl = ttl || TTL_ONE_DAY;
    var memcachedKey = getMemcachedKey( table, key );
    app_memcached.set( memcachedKey, value, ttl, function( err, memReturnData ) {
        if(err){
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
            callback(err, null);
        } else {
            callback( null, memReturnData );
        }
    });
}

module.exports.getItemOfTypeWithKeyInTable = function( type, key, table, callback ) {
    var keyObj = {};
    keyObj['key'] = {
        'S' : key
    };
    dynamodb.getItem( {
        TableName: table,
        Key: keyObj
    }, function( err, dynData ) {
        if( err ) {
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
        }
        if( dynData && dynData.Item && dynData.Item['value'] && dynData.Item['value'][type] ) {
            var value = dynData.Item['value'][type];
            callback( err, value );
        } else {
            console.log( 'missed item' );
            // if no dynamodb hit, return null
            callback( err, null );
        }
    });
};

function putValueWithTypeForKeyInTable( value, type, key, table, callback ) {
    var itemObj = {};
    itemObj['key'] = {
        'S' : key
    };
    itemObj['value'] = {};
    itemObj['value'][type] = value;

    var result = {};
    dynamodb.putItem({
        TableName: table,
        Item: itemObj,
        ReturnValues: "ALL_OLD"
    }, function( err, dynReturnData ) {
        if( err ){
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
            callback( err, null );
        } else {
            result[KEY_DISK] = dynReturnData;
            callback( null, result );
        }
    });
}
module.exports.putValueWithTypeForKeyInTable = putValueWithTypeForKeyInTable;

function putItem(tableName, item, callback) {
    dynamodb.putItem({
        TableName: tableName,
        Item: item,
        ReturnValues: "NONE"
    }, function( err, dynReturnData) {
        if( err ) {
            if( callback ) {
                LogManager.logError(`Problem in DataManager.putItem: ${tableName}, ${JSON.stringify(item)}`, err);
                // if(env.name === 'development') {
                //   process.exit();
                // }
                return callback(err);
            }
        } else {
            if( callback ) {
                return callback( null, dynReturnData );
            }
        }
    });
}
module.exports.putItem = putItem;

function getItem(key, table, callback) {
    dynamodb.getItem({
        TableName: table,
        Key: key
    }, function(err, dynData) {
        if (err) {
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
            callback(err);
        } else if (dynData && dynData.Item) {
            callback(null, dynData.Item);
        } else {
            callback();
        }
    });
};
module.exports.getItem = getItem;

function copyItem(originalKey, targetKey, table, callback) {
  getItemWithKeyInTable(originalKey, table, (err, item)=>{
    if(err) return callback(err);
    putValueForKeyInTable(item, targetKey, table, (err, saveData)=>{
      if(err) return callback(err);
      callback(null, saveData);
    });
  });
}
module.exports.copyItem = copyItem;

module.exports.getNewId = function (type, callback) {
    dynamodb.updateItem({
        TableName: type + "Count",
        Key: {
            "key": {
                "S":"global"
            }
        },
        AttributeUpdates: {
            "value" : {
                "Action" : "ADD",
                "Value" : {
                    "N": "1"
                }
            }
        },
        ReturnValues: "ALL_NEW"
    }, function(err, data){
        if(err) {
            callback( err, null );
        } else {
            var id = data.Attributes.value.N;
            callback( err, id );
        }
    });
}

function deleteItemInCache(tableName, key, callback) {
    var memcachedKey = getMemcachedKey( tableName, key );
    app_memcached.del(memcachedKey, function(err) {
        if (callback) {
            callback(err);
        }
    });
}
module.exports.deleteItemInCache = deleteItemInCache;

function deleteItemInTable(table, key, callback) {
    dynamodb.deleteItem({
        TableName: table,
        Key: {
            "key": {
                "S": key
            }
        }
    }, function( err ) {
        if(err) {
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
        }
        if(callback) {
            callback(err);
        }
    });
}

module.exports.deleteItem = function(table, key, callback) {
    deleteItemInCache(table, key, function(err) {
        if (err) {
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
            if( callback ) {
                callback(err);
            }
        } else {
            deleteItemInTable(table, key, function(err) {
                if( callback ) {
                    callback(err);
                } else {
                    if( callback ) {
                        callback( null, {"success": true});
                    }
                }
            });
        }
    });
}

module.exports.deleteJob = function(key, runAt, callback) {
    var table = "Jobs";
    dynamodb.deleteItem({
        TableName: table,
        Key: {"key": {'N': key}, "run_at": {'N': runAt}}
    }, function(err){
        if(err) {
            var message = "Table causing error: " + table;
            LogManager.logError( message, err );
        }
        if(callback) {
            callback();
        }
    });
}

var query = function(params, result, callback) {
    dynamodb.query(params, function( err, data ) {
        if( err || !data ) {
            var message = "Table causing issue: " + params.TableName;
            message += (!err && !data) ? "\nMissing data return." : "";
            LogManager.logError( message, err );
        }
        if(!result) {
            result = data;
        } else if(data.Items && data.Count) {
            result.Items = result.Items.concat(data.Items);
            result.Count += data.Count;
        }
        if(data && data.LastEvaluatedKey && !params.Limit) {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            query( params, result, callback );
        } else {
            callback( err, result );
        }
    });
}
module.exports.query = query;

module.exports.scan = function(tableName, select, scanFilter, limit, callback) {
    var obj = {
        TableName: tableName,
        Select: select,
        ScanFilter: scanFilter
    };
    if(limit) {
        obj.Limit = limit;
    }
    doScan( obj, null, callback );
}

function doScan( params, result, callback ) {
    dynamodb.scan(params, function( err, data ) {
        if( err || !data ) {
            var message = "Table causing issue: " + params.TableName;
            message += (!err && !data) ? "\nMissing data return." : "";
            LogManager.logError( message, err );
        }
        if(!result) {
            result = data;
        } else if(data && data.Items && data.Count) {
            result.Items = result.Items.concat(data.Items);
            result.Count += data.Count;
        }
        if(data && data.LastEvaluatedKey && !params.Limit) {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            doScan( params, result, callback );
        } else {
            callback( err, result );
        }
    });
}

function getMemcachedKey( table, key ) {
    return table + ':' + key;
}

function getLockKey(key) {
    return 'lock:' + key.toString();
}

var getLock = function(key, callback) {
    var memcacheKey = getLockKey(key);
    app_memcached.add(memcacheKey, 'locked', TTL_LOCK, function(err, memData) {
        callback(err);
    });
};
module.exports.getLock = getLock;

var deleteLock = function(key) {
    var memcacheKey = getLockKey(key);
    app_memcached.del(memcacheKey, function(err) {
        if (err) {
            LogManager.logError( "deleteLock failed", err );
        }
    });
};
module.exports.deleteLock = deleteLock;

var getDynamoDBFormattedObject = function(item) {
    var formattedItem = {};
    Object.keys(item).forEach(function(key) {
        var value = item[key];
        if (typeof value == 'number') {
            formattedItem[key] = { 'N': value.toString() };
        } else if (typeof value == 'string') {
            formattedItem[key] = { 'S': value };
        } else {
            formattedItem[key] = { 'S': JSON.stringify(value) };
        }
    });

    return formattedItem;
};
module.exports.getDynamoDBFormattedObject = getDynamoDBFormattedObject;

var parseDynamodDBFormattedObject = function(item) {
    var parsedObj = {};
    Object.keys(item).forEach(function(key) {
        var valObj = item[key];
        if (valObj.hasOwnProperty('N')) {
            parsedObj[key] = Number(valObj['N']);
        } else if (valObj.hasOwnProperty('S')) {
            parsedObj[key] = valObj['S'].toString();
        }
    });

    return parsedObj;
};
module.exports.parseDynamodDBFormattedObject = parseDynamodDBFormattedObject;
