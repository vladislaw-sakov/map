module.exports.getUidFromReq = function(req, paramNameOverride) {
  var paramName = paramNameOverride || 'uid';
  if(process.env.NODE_ENV == 'production') {
    if(req.params[paramName]) {
      return req.params[paramName] == req.user ? req.user : null;
    } else {
      return req.user;
    }
  } else {
    return req.params[paramName] || req.user;
  }
}
