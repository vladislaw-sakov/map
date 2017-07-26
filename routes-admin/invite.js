var async = require('async')
, DataManager = require('../lib/managers/DataManager.js')
, TableConsts = require('../lib/constants/TableConsts.js')
, UserManager = require('../lib/managers/UserManager.js')
, UserPasswordManager = require('../lib/managers/UserPasswordManager.js')
, _ = require('underscore')
, moment = require ('moment')
;

module.exports = function(app, express) {
  var TYPE_APPLICANT = 'applicant';
  var getChannelForKey = function(key) {
      return key.indexOf('@') === -1 ? 'phone' : 'email';
  };
  var generateCodesForKeys = function(userKeysets, vip, callback) {
      var filteredUserKeysets = [];
      async.eachSeries(userKeysets, function(userKeyset, localCallback) {
          if(!Array.isArray(userKeyset)) {
              userKeyset = [userKeyset];
          }
          var filteredUserKeyset = [];
          async.eachSeries(userKeyset, function(key, localCallback2) {
             DataManager.getItem({"key": {"S": key}, "type": {"S": TYPE_APPLICANT}}, TableConsts.WaitingList, function(err, applicant) {
                  if(applicant && applicant.deleted.N === "1") //don't send notifs to recipient twice
                      return localCallback2();
                  filteredUserKeyset.push(key);
                  if(!applicant)
                      return localCallback2();
                 applicant.deleted.N = "1";
                 DataManager.putItem(TableConsts.WaitingList, applicant, localCallback2);
             });
          }, function(err) {
              if(filteredUserKeyset.length) {
                  filteredUserKeysets.push(filteredUserKeyset);
              }
              localCallback();
          });
      }, function(err) {
          var message = '';
          async.eachSeries(filteredUserKeysets, function(userKeyset, localCallback) {
              UserManager.getNewInviteCode(function(err, code) {
                  var codeData = vip ? {"vip": true} : {};
                  async.eachSeries(userKeyset, function(key, localCallback2) {
                      var channel = getChannelForKey(key);
                      codeData[channel] = key;
                      if (channel == "email") {
                          //EmailManager.sendInviteCodeEmail( key, code );
                      } else if (channel == "phone") {
                          //SMSManager.sendInviteCodeSMS( key, code );
                      }
                      DataManager.putValueForKeyInTableNoCache( JSON.stringify(codeData), code, TableConsts.InviteCodes, function(){
                          message += ("Key " + key + " received code " + code + "<BR />");
                          localCallback2();
                      });
                  }, localCallback);
              });
          }, function(err) {
              callback(null, filteredUserKeysets.length, message)
          });
      });
  };
  var getWaitingList = function(formatFriendly, callback) {
      var params = {
          TableName: TableConsts.WaitingList,
          IndexName: 'DeletedIndex',
          KeyConditions: {
              "deleted": { "ComparisonOperator": "EQ", AttributeValueList: [{"N": '0'}] },
              "type": { "ComparisonOperator": "EQ", AttributeValueList: [{"S": TYPE_APPLICANT}] }
          }
      };
      DataManager.query(params, null, function(err, data) {
          var items;
          if(data.Count > 0) {
              items = data.Items;
              if(formatFriendly) {
                  for (var i = 0; i < items.length; i++) {
                      if (items[i].metadata.S) {
                          var metadata = JSON.parse(items[i].metadata.S);
                          if (metadata.created_at) {
                              items[i].created_at = moment.unix(metadata.created_at).fromNow();
                          }
                          if (metadata.source) {
                              items[i].source = metadata.source;
                          }
                      }
                      items[i].key = items[i].key.S;
                      items[i].priority = parseInt(items[i].priority.N);
                  }
                  items = _.sortBy(items, 'priority');
              } else {
                  items = _.sortBy(items, function(item) { return parseInt(item.priority.N)});
              }
          }
          callback(null, items || []);
      });
  };
  var renderInvitePage = function(req, res, params) {
      getWaitingList(true, function(err, items) {
          var result = {"queueTotal": items.length, "applicants": items};
          if(params) {
              _.extend(result, params)
          }
          res.render('admin-invite', result);
      });
  };
  app.get('/invite', function( req, res ) {
      UserPasswordManager.checkUserRole(req.user, function(err, role) {
          return role != "admin" ? res.redirect('/') : renderInvitePage(req, res);
      });
  });
  app.post('/invite/bypass', function( req, res ) {
      UserPasswordManager.checkUserRole(req.user, function(err, role) {
          if( role != "admin" )
              return res.redirect('/');
          var email = req.body.email;
          var phone = req.body.phone;
          var message= '';
          if(email && !validator.isEmail(email)) {
              message += "Bypass email address is invalid<br />";
          }
          if(phone && (phone[0] != "+" || isNaN(phone.substr(1)))) {
              message += "Bypass phone number is invalid<br />";
          }
          if(!email && !phone) {
              message += "Bypass phone number and email can not both be empty<br />";
          }
          if(message.length)
              return renderInvitePage(req, res, {"email": email, "phone": phone, "message": message});
          var userKeysets = [];
          userKeysets.push(email && phone ? [email, phone] : (email || phone));
          generateCodesForKeys(userKeysets, req.body.vip == "on", function(err, total, message) {
              renderInvitePage(req, res, {"message": (total + (total === 1 ? " user was" : " users were") + " invited.<BR />" + message)});
          });
      });
  });
  app.post('/invite/amount', function( req, res ) {
      UserPasswordManager.checkUserRole(req.user, function(err, role) {
          if (role != "admin")
              return res.redirect('/');
          var message;
          var isPositiveInteger = function(n) {
              return 0 === n % (!isNaN(parseFloat(n)) && 0 <= ~~n);
          };
          var amount = req.body.amount;
          if (!amount) {
              message = "Please provide an amount";
          } else if (!isPositiveInteger(parseInt(amount))) {
              message = "Please provide a positive integer";
          } else if (parseInt(amount) > parseInt(req.body.queueTotal)) {
              message = "Please provide an amount less than the total number of applicants in the queue.";
          }
          if(message)
              return renderInvitePage(req, res, {"message": message});
          getWaitingList(false, function(err, applicants) {
              applicants = applicants.slice(0, Math.min(applicants.length, parseInt(amount)));
              var keys = [];
              async.eachSeries(applicants, function(applicant, localCallback) {
                  keys.push(applicant.key.S);
                  applicant.deleted = {"N": "1"};
                  DataManager.putItem(TableConsts.WaitingList, applicant, localCallback);
              }, function(err) {
                  generateCodesForKeys(keys, false, function() {
                      renderInvitePage(req, res, {"message": (amount + " users were invited.")});
                  });
              });
          });
      });
  });
  app.post('/invite/specific', function( req, res ) {
      UserPasswordManager.checkUserRole(req.user, function(err, role) {
          if (role != "admin")
              return res.redirect('/');
          generateCodesForKeys(Object.keys(req.body), false, function(err, total) {
              renderInvitePage(req, res, {"message": (total + " users were invited.")});
          });
      });
  });
}
