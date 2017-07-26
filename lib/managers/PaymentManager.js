var DataManager = require('./DataManager')
, LogManager = require('./LogManager.js')
, async = require('async')
, crypto = require('crypto')
, _ = require('underscore')
, Slack = require('node-slack')
, validator = require('validator')
, TableConsts = require('../constants/TableConsts.js')
, stripe = require('stripe')(env.current.stripe.key)
;

var TYPE_STRIPE = 'stripe';
var slack = new Slack( 'simplelabs', env.current.slack.key );

var sendTxMsgs = function(msg, subject) {
  if (env.name != 'api' && env.name != 'production') {
    return;
  }

  slack.send({
    text: msg,
    channel: "#payments",
    username: 'New Purchase on ' + env.name
  });
}

var processPayment = function(params) {
  var finalResult = {};
  async.series([
    function(callback) {

      fetchProductDetails({}, function(err, productDetails) {
        if (err) {
          callback(err);
          var message = `Failed payment transation! ${JSON.stringify(params)}`;
          slack.send({
            text: message,
            channel: "#payments",
            username: 'Failed Purchase on ' + env.name
          });
          console.log( err );
        } else {
          params = Object.assign(params, productDetails);
          callback();
        }
      });
    },
    function(callback) {
      if (params.saveCard) {
        storeCreditCard(params.uid, params.stripeToken, function(err, card) {
          if (err) {
            callback(err);
            var message = "Failed payment transation!\nuid: " + params.uid + ", taskId: " + params.taskId + ", recoId: " + params.recoId + "\nstoreCreditCard";
            slack.send({
              text: message,
              channel: "#payments",
              username: 'Failed Purchase on ' + env.name
            });
            console.log( err );
          } else {
            finalResult.card = card;
            params.cardId = card.id;
            callback();
          }
        });
      } else {
        callback();
      }
    },
    function(callback) {
      params.charge = {
        "amount": params.amount,
        "currency": "usd",
        "description": params.description
      };
      if (params.cardId) {
        stripeCustomerIdForUser(params.uid, function(err, customerId) {
          if (err) {
            callback(err);
            var message = "Failed payment transation!\nuid: " + params.uid + ", taskId: " + params.taskId + ", recoId: " + params.recoId + "\nstripeCustomerIdForUser";
            slack.send({
              text: message,
              channel: "#payments",
              username: 'Failed Purchase on ' + env.name
            });
            console.log( err );
          } else {
            params.charge.source = params.cardId;
            params.charge.customer = customerId;
            callback();
          }
        });
      } else {
        params.charge.source = params.stripeToken;
        callback();
      }
    },
    function(callback) {
      stripe.charges.create(params.charge, function(err, transaction) {
        if (err) {
          console.log( err );
          logTransaction("fail", params.uid, params.taskId, params.recoId, params.discountedPrice, params.description, err,
          params.shippingAddress, params.billingAddress, params.productUrl, params.userComment);
          callback(err);
          var message = "Failed payment transation!\nuid: " + params.uid + ", taskId: " + params.taskId + ", recoId: " + params.recoId + "\nstripe.charges.create";
          slack.send({
            text: message,
            channel: "#payments",
            username: 'Failed Purchase on ' + env.name
          });
        } else {
          var transactionId = logTransaction("success", params.uid, params.taskId, params.recoId, params.discountedPrice, params.description,
          transaction, params.shippingAddress, params.billingAddress, params.productUrl, params.userComment);
          if (params.couponCode) {
            params.couponCode = params.couponCode.trim();
            if (params.couponCode != "") {
              CouponManager.couponRedeemed(transactionId, params.uid, params.couponCode);
            }
          }

          finalResult.transactionId = transactionId;
          finalResult.transaction = transaction;
          callback();

          var msg = 'New Payment Transaction'
          + '\n\nProduct URL: ' + params.productUrl
          + '\nAmount: ' + formattedDollarAmount(params.discountedPrice)
          + '\nDescription: ' + params.description
          + '\nUser Comment: ' + params.userComment
          + '\nTask Link: ' + env.current.vanity_url + '/w/' + TaskManager.getHashForTask({"uid": params.uid, "id": params.taskId})
          + '\nAdmin Link: ' + env.current.admin_url + '/admin/task/' + params.uid + ":" + params.taskId
          + '\nTransaction ID: ' + transactionId
          + '\nShipping Address: ';

          var shippingAddress = params.shippingAddress;
          if( shippingAddress.name ) {
            msg += ("\n  name : " + shippingAddress.name );
            delete shippingAddress.name;
          }
          if( shippingAddress.street ) {
            msg += ("\n  street : " + shippingAddress.street );
            delete shippingAddress.street;
          }
          if( shippingAddress.apt ) {
            msg += ("\n  apt : " + shippingAddress.apt );
            delete shippingAddress.apt;
          }
          if( shippingAddress.city ) {
            msg += ("\n  city : " + shippingAddress.city );
            delete shippingAddress.city;
          }
          if( shippingAddress.state ) {
            msg += ("\n  state : " + shippingAddress.state );
            delete shippingAddress.state;
          }
          if( shippingAddress.zip ) {
            msg += ("\n  zip : " + shippingAddress.zip );
            delete shippingAddress.zip;
          }
          if( shippingAddress.country ) {
            msg += ("\n  country : " + shippingAddress.country );
            delete shippingAddress.country;
          }

          for(var key in shippingAddress) {
            msg += ("\n  " + key + ": " + shippingAddress[key]);
          }
          if (params.couponCode) {
            msg += '\nCoupon Code: ' + params.couponCode;
          }
          sendTxMsgs(msg, "New payment for " + formattedDollarAmount(params.discountedPrice));
        }
      });
    }
  ], function(err) {
    if( err ) {
      console.log( err );
    }
    callback(err, finalResult);
  });
};
module.exports.processPayment = processPayment;

/**
 * @param {Object} options - The options for fetching a product's details
 * @param {Function} callback - Callback with signature (error, result) where result will be
 *    an object with an amount (in pennies).
 */
var fetchProductDetails = function(options, callback) {
  var productDetails = {
    "amount": 100,
    "description": "Trial period subscription."
  };
  callback(null, productDetails);
};

var logTransaction = function(status, uid, taskId, recoId, amount, description, transactionObj, shippingAddress, billingAddress, productUrl, userComment) {
  // TODO: Write method to urlencode and stringify addresses
  var key = generateUniqueId(uid, taskId, recoId); //TODO: reuse this for quiz id creation
  var createdAt = Math.round(_.now()/1000).toString();

  var item = {
    "key": {
      "S": key
    },
    "uid": {
      "N": uid.toString()
    },
    "creation_date": {
      "N": createdAt
    },
    "amount": {
      "N": amount.toString()
    },
    "type": {
      "S": "charge"
    },
    "status": {
      "S": status
    },
    "transactionResponse": {
      "S": JSON.stringify(transactionObj)
    },
    "shippingAddress": {
      "S": JSON.stringify(shippingAddress)
    },
    "billingAddress": {
      "S": JSON.stringify(billingAddress)
    },
    "taskId": {
      "N": taskId.toString()
    },
    "recoId": {
      "N": recoId.toString()
    }
  };

  if (productUrl) {
    item.productUrl = {
      "S": productUrl
    };
  }
  if (description) {
    item.description = {
      "S": description
    }
  }

  if ( userComment) {
    item.userComment = {
      "S": userComment
    }
  }

  DataManager.putItem(TableConsts.PaymentTransactions, item);

  return key;
};

var generateUniqueId = function(uid, taskId, recoId) {
  var secret = '1vNPVmRUr8A8eajcis8c';
  var currentTime = new Date().getTime(); // Use current timestamp as salt
  var strToHash = uid + taskId + recoId + secret + currentTime;
  var id = crypto.createHash('sha256').update(strToHash).digest('base64');
  return id;
};

var sendConfirmation = function(uid, email, transactionId) {
  // For now just send slack message
  var subject = "User " + uid + " requested order confirmation";
  var msg = "User ID: " + uid
  + "\nTransactionId " + transactionId
  + "\nEmail: " + email;
  sendTxMsgs(msg, subject);
  dynamodb.getItem({
    TableName: TableConsts.PaymentTransactions,
    Key: {"key": {"S": transactionId}}
  }, function(err, tx) {
    console.log(`TODO: SEND EMAIL ${JSON.stringify}`);
  });

};
module.exports.sendConfirmation = sendConfirmation;

var formattedDollarAmount = function(pennyAmount) {
  var dollarAmount = pennyAmount / 100.0;
  var parts = dollarAmount.toString().split('.');
  if (parts.length == 1) {
    return '$' + parts[0] + '.00';
  }

  parts[1] = (parts[1].length < 2) ? parts[1] + '0' : parts[1];
  return '$' + parts[0] + '.' + parts[1];
};

var storeCreditCard = function(uid, token, callback) {
  async.waterfall([
    function(callback) {
      // Get stripe customer ID.
      stripeCustomerIdForUser(uid, function(err, customerId) {
        if (err) {
          callback(err);
        } else {
          callback(null, customerId);
        }
      });
    },
    function(customerId, callback) {
      // Associate card with customer Id
      stripe.customers.createCard(customerId, {source: token}, function(err, card) {
        if (err) {
          callback(err);
        } else {
          callback(null, card);
        }
      });
    },
    function(card, callback) {
      // Check to see if card already exists for customer
      getCreditCardsForUser(uid, function(err, cards) {
        cards.forEach(function(existingCard) {
          if (existingCard.fingerprint == card.fingerprint) {
            deleteCreditCard(existingCard.customer, existingCard.id);
          }
        });
        callback(null, card);
      });
    },
    function(card, callback) {
      // Store card in database
      var item = DataManager.getDynamoDBFormattedObject(card);
      item.type = { 'S': 'stripe' };
      item.createdAt = { 'N': Math.round(new Date().getTime()/1000).toString() };
      DataManager.putItem(TableConsts.CreditCards, item, function(err) {
        if (err) {
          callback(err);
        } else {
          // Remove customer Id before sending back
          delete card.customer;
          callback(null, card);
        }
      });
    }
  ], function(err, card) {
    callback(err, card);
  });
};
module.exports.storeCreditCard = storeCreditCard;

var getSafeCreditCardsForUser = function(uid, callback) {
  getCreditCardsForUser(uid, function(err, cards) {
    if (err) {
      return callback(err);
    }

    var safeCards = [];
    cards.forEach(function(card) {
      delete card.customer;
      safeCards.push(card);
    });
    callback(null, safeCards);
  });
};
module.exports.getSafeCreditCardsForUser = getSafeCreditCardsForUser;

var getCreditCardsForUser = function(uid, callback) {
  stripeCustomerIdForUser(uid, function(err, customerId) {
    if (err) {
      return callback(err);
    } else if (!customerId) {
      return callback(new Error('Failed to get customerId of user ' + uid));
    }

    var params = {
      TableName: TableConsts.CreditCards,
      IndexName: 'customerIndex',
      KeyConditions: {
        "customer": { "ComparisonOperator": "EQ", AttributeValueList: [{"S": customerId}] },
        "type": { "ComparisonOperator": "EQ", AttributeValueList: [{"S": TYPE_STRIPE}] }
      }
    };
    DataManager.query(params, null, function(err, result) {
      if (err) {
        return callback(err);
      }

      var creditCards = [];
      result.Items.forEach(function(cardData) {
        var creditCard = DataManager.parseDynamodDBFormattedObject(cardData);
        creditCards.push(creditCard);
      });
      callback(null, creditCards);
    });
  });
};
module.exports.getCreditCardsForUser = getCreditCardsForUser;

var deleteCreditCard = function(customerId, cardId) {
  dynamodb.deleteItem({
    TableName: TableConsts.CreditCards,
    Key: {
      "id": {'S': cardId },
      "type": {'S': TYPE_STRIPE }
    }
  }, function(err){
    if(err) {
      console.log("Error deleting card " + cardId + " : " + err.message);
    } else {
      stripe.customers.deleteCard(customerId, cardId, function(err, confirmation) {
        if (err) {
          console.log("Error deleting stripe card " + cardId + " for customer " + customerId + ": " + err.message);
        }
      });
    }
  });
};
module.exports.deleteCreditCard = deleteCreditCard;

var createStripeCustomerForUidWithToken = function(uid, token, callback) {
  stripe.customers.create({
    source: token,
    description: uid
  }).then((customer)=>{
    console.log(`customer: ${customer}`);
    DataManager.putValueForKeyInTable(customer.id, uid, TableConsts.UserStripe, (error, saveData)=>{
      if(error) {
        return callback(error);
      } else {
        return callback(null, customer);
      }
    });
  }).catch((error)=>{
    callback(error);
  });
}
module.exports.createStripeCustomerForUidWithToken = createStripeCustomerForUidWithToken;

var stripeCustomerIdForUser = function(uid, callback) {
  DataManager.getItemWithKeyInTable(uid, TableConsts.UserStripe, function(err, customerId) {
    if (err) {
      return callback(err);
    } else if (customerId) {
      return callback(null, customerId);
    }

    // Create Stripe Customer Id for user
    stripe.customers.create({
      metadata: {
        "uid": uid
      }
    }, function(err, customer) {
      if (err) {
        return callback(err);
      }
      // Store customer in database
      async.parallel([
        function(localCallbackA) {
          DataManager.putValueForKeyInTable(customer.id, uid, TableConsts.UserStripe, localCallbackA);
        },
        function(localCallbackB) {
          DataManager.putValueForKeyInTable(uid, 'stripe_'+customer.id, TableConsts.UserId, localCallbackB);
        }
      ], function(err, results) {
        if (err) {
          callback(err);
        } else {
          callback(null, customer.id);
        }
      });
    });
  });
};
module.exports.getPurchaseCount = function(uid, taskId, callback) {
  //TODO: store result in memcache ideally with 6 hr expiry
  var params = {
    TableName: TableConsts.PaymentTransactions, IndexName: "UidIndex",
    KeyConditions: {
      "type": {"ComparisonOperator": "EQ", "AttributeValueList": [{"S": "charge"}]},
      "uid": {"ComparisonOperator": "EQ", "AttributeValueList": [{"N": String(uid)}]}
    }
  };
  var purchaseCount = 0;
  DataManager.query( params, null, function( err, data ) {
    if(!data || data.Count == 0)
    return callback(null, purchaseCount);
    async.eachSeries(data.Items, function(item, localCallback) {
      DataManager.getItem({"key": {"S": item.key.S}}, TableConsts.PaymentTransactions, function(err, data) {
        if(data.status.S == "success" && parseInt(data.taskId.N) == taskId) {
          purchaseCount++;
        }
        return localCallback();
      });
    }, function(err) {
      return callback(null, purchaseCount);
    });
  });
}
