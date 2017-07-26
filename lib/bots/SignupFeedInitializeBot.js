/**
 * Created by robby on 2/3/16.
 */

"use strict";

var UserActivityStreamManager = require('../managers/UserActivityStreamManager.js')
  , UserManager = require('../managers/UserManager.js')
  , async = require('async')
  , JobManager = require('../managers/JobManager.js')
  , UserAlertsManager = require('../managers/UserAlertsManager.js')
  , EmailConstants = require('../constants/email/EmailConstants.js')
  , LogManager = require('../managers/LogManager.js')
  , CampaignUtilities = require('../utilities/CampaignUtilities.js')
  ;

var starterFeedContent = ["1011039:16", "1011039:20", "1011039:14", "1011039:21", "1011039:11", "1011039:23"];

class SignupFeedInitializeBot {
  constructor(uid, email, options) {
    this.uid = uid;
    this.email = email;
    this.options = options;
  }

  run() {
    var now = Math.round(new Date().getTime() / 1000);
    async.series([
      (callback)=> {
        async.eachSeries(starterFeedContent, (key, callbackInner)=>{
          var parts = key.split(':');
          UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid(parts[0], parts[1], this.uid).then((copyResponse)=>{
            callbackInner();
          }).catch(error=>{
            callbackInner();
            var message = "Problem copying:"+ parts[0] +":"+ parts[1] +" to :"+ this.uid;
            LogManager.logError(message, error);
          });
        }, (err)=>{
          callback();
        });
      },

      (callback)=> {
        // do campaign stuff
        if(this.options && this.options.campaign) {
          var campaign = CampaignUtilities.getBaseCampaignKey(this.options.campaign);
          if(!env.current.campaigns || !env.current.campaigns.hasOwnProperty(campaign)) {
            return callback();
          }
          var campaignData = env.current.campaigns[campaign];
          if(!campaignData.hasOwnProperty("starterFeedContent")) {
            return callback();
          }
          var campaignStarterFeedContent = campaignData["starterFeedContent"];

          async.eachSeries(campaignStarterFeedContent, (key, callbackInner)=>{
            var parts = key.split(':');
            UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid(parts[0], parts[1], this.uid).then((copyResponse)=>{
              callbackInner();
            }).catch(error=>{
              callbackInner();
              var message = "Problem copying:"+ parts[0] +":"+ parts[1] +" to :"+ this.uid;
              LogManager.logError(message, error);
            });
          }, (err)=>{
            callback();
          });
        } else {
          callback();
        }
      },

      (callback)=> {
        var options = {
          "categories": ["welcome"],
          "asmGroupID": 69,
          "templateId": EmailConstants.WELCOME_TEMPLATE_ID
        };
        UserAlertsManager.sendEmailToUidsWithOptions([this.uid], options);
        callback();
      }//,

      // (callback)=> {
      //   var targetTime = now + 60 * 60 * 1; // 1 hour
      //   // targetTime = now + 60 * 1 * 1; // Dev one minute
      //   JobManager.createJob(targetTime, 'addSwellistTipsByBatchId', [this.uid, "signup_batch_1"]);
      //   callback();
      // },
      //
      // (callback)=> {
      //   var targetTime = now + 60 * 60 * 6; // 6 hour
      //   // targetTime = now + 60 * 1 * 2; // Dev two minutes
      //   JobManager.createJob(targetTime, 'addSwellistTipsByBatchId', [this.uid, "signup_batch_2"]);
      //   callback();
      // },
      //
      // (callback)=> {
      //   var targetTime = now + 60 * 60 * 24; // 24 hour
      //   // targetTime = now + 60 * 1 * 4; // Dev three minutes
      //   JobManager.createJob(targetTime, 'addSwellistTipsByBatchId', [this.uid, "signup_batch_3"]);
      //   callback();
      // }
    ], (err)=> {

    });
  }

  addHtmlActivityStreamObjectWithTile(tileString, name) {
    return new Promise((fulfill, reject)=> {
      var userTipData = {
        "uid": this.uid,
        type: "Article",
        name: name,
        mediaType: "text/html",
        content: encodeURIComponent(tileString)
      };
      UserActivityStreamManager.createUserActivityStreamObject(userTipData).then((saveData)=> {
        fulfill(saveData);
      }, (error)=> {
        reject(error);
      });
    });
  }

  addActivityStreamObjectWithContent(tip) {
    return new Promise((fulfill, reject)=> {
      UserActivityStreamManager.createUserActivityStreamObject(tip).then((saveData)=> {
        fulfill(saveData);
      }, (error)=> {
        reject(error);
      });
    });
  }

}

module.exports = SignupFeedInitializeBot;
