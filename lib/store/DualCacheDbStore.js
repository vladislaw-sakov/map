module.exports = function(session) {
    var Store = session.Store;
    function DualCacheDbStore(options) {
        options = options || {};
        Store.call(this, options);
        if (!options.client) {
            options.client = require('../managers/DataManager');
        }
        this.client = options.client;
    }
    DualCacheDbStore.prototype.__proto__ = Store.prototype;
    DualCacheDbStore.prototype.get = function(sid, fn) {
        this.client.getItemWithKeyInTable(sid, 'Session', function(err, data) {
            if (err) { return fn(err, {}); }
            try {
                if (!data) {
                    return fn();
                }
                fn(null, JSON.parse(data.toString()));
            } catch (e) {
                fn(e);
            }
        });
    }
    DualCacheDbStore.prototype.set = function(sid, sess, fn) {
        try {
            this.client.putValueForKeyInTable(JSON.stringify(sess), sid, 'Session', function(err, result) {
                fn(err, result);
            });
        } catch (err) {
            fn && fn(err);
        }
    }
    DualCacheDbStore.prototype.destroy = function(sid, fn) {
         this.client.deleteItem('Session', sid, fn);
    }
    return DualCacheDbStore;
}
