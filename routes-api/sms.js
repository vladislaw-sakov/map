"use strict";

var SMSManager = require('../lib/managers/SMSManager.js')
;

module.exports = function(app, express) {
  app.post('/:version/sms/', (req, res)=>{
    console.log(`${JSON.stringify(req.body)}`);

    SMSManager.handleIncomingSMSMessage(req.body).then((result)=>{
      return res.success(result);
    }).catch((error)=>{
      return res.fail(error.name, error.message);
    });
  });
}
