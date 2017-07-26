var TableConsts = require('../constants/TableConsts.js')
, DocumentManager = require('./DocumentManager.js')
;

module.exports.SERVICES = {
  "google": "google"
}

function storeUidTokenForService(uid, token, service) {
  var key = {
    "uid": uid,
    "service": service
  }
  var item = {
    "uid": uid,
    "service": service,
    "token": token
  }
  return DocumentManager.updateDocumentWithKeyInTable(item, key, TableConsts.UserTokens);
}
module.exports.storeUidTokenForService = storeUidTokenForService;

function fetchTokenForUidAndService(uid, service) {
  return DocumentManager.getDocumentWithKeyFromTable({"uid": uid, "service": service}, TableConsts.UserTokens);
}
module.exports.fetchTokenForUidAndService = fetchTokenForUidAndService;
