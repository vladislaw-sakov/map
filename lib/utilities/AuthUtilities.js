var SessionManager = require('../managers/SessionManager.js')
, LogManager = require('../managers/LogManager.js')
, UserPasswordManager = require('../managers/UserPasswordManager.js')
;

module.exports.isAdminToken = function(token) {
  return new Promise((fulfill, reject)=>{
    SessionManager.getSession(token, function( err, session ) {
      if (err) {
        LogManager.logError("Failed to fetch uid from token.", err);
        reject(err);
      } else {
        UserPasswordManager.checkUserRole(session.key, function(err, role) {
          if (err) {
            reject(err);
          } else {
            fulfill(role === "admin"); // checkUserRole returns null if no role
          }
        });
      }
    });
  });
};
