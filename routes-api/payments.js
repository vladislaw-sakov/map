"use strict";

var PaymentManager = require('../lib/managers/PaymentManager.js')
;

module.exports = function(app, express) {
  app.post('/:version/user/:uid/payments/save', (req, res)=>{
    var uid = req.params.uid;
    var token = req.body.id;
    console.log(`${JSON.stringify(req.body)}`);
    PaymentManager.createStripeCustomerForUidWithToken(uid, token, (error, createResult)=>{
      if(error) {
        return res.fail("stripe_customer_create_failed", error.message);
      }
      res.success(createResult);
    });
  });
}
