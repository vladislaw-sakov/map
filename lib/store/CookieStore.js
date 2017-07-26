var AppDispatcher = require('../dispatcher/AppDispatcher')
, EventEmitter = require('events').EventEmitter
, cookie = require('cookie')
;

var CookieStore = Object.assign({}, EventEmitter.prototype, {
  getCookieValueForKey: function(key) {
    var cookies = cookie.parse(document.cookie);
    if(cookies[key]){
      return cookies[key];
    }
    return null;
  }
});

module.exports = CookieStore;
