/**
 * Created by robby on 2/2/16.
 */

var UserManager = require('../lib/managers/UserManager.js')
  , UserAlertsManager = require('../lib/managers/UserAlertsManager.js')
  , EmailConstants = require('../lib/constants/email/EmailConstants.js')
  , UserActivityStreamManager = require('../lib/managers/UserActivityStreamManager.js')
  , async = require('async')
  ;

module.exports = function (app, express) {

  app.post('/:version/notifications/send', (req, res)=> {
    var uids = req.body.uids;
    var templateId = req.body.templateId;
    var categories = [];
    var options = {};
    if (req.body.substitutions) {
      options.substitutions = req.body.substitutions;
    }
    if (req.body.subject) {
      options.subject = req.body.subject;
    }
    options.templateId = templateId;
    switch (templateId) {
      case EmailConstants.NOTES_TEMPLATE_ID:
        options.categories = ["notes"];
        options.asmGroupID = 549;
        break;
      case EmailConstants.COMPLETE_PROFILE_TEMPLATE_ID:
        options.categories = ["complete_profile"];
        options.asmGroupID = 549;
        break;
      case EmailConstants.UPLOAD_IMAGE_TEMPLATE_ID:
        options.categories = ["image_upload"];
        options.asmGroupID = 549;
        break;
      case EmailConstants.WELCOME_TEMPLATE_ID:
        options.categories = ["welcome"];
        options.asmGroupID = 69;
        break;
      case EmailConstants.NEW_TIPS_TEMPLATE_ID:
        options.categories = ["new_tips"];
        options.asmGroupID = 543;
        break;
      case EmailConstants.ADD_TO_HOMESCREEN_TEMPLATE_ID:
        options.categories = ["add_to_homescreen"];
        options.asmGroupID = 549;
        break;
      case EmailConstants.LAPSED_USER_TEMPLATE_ID:
        options.categories = ["lapsed_user"];
        options.asmGroupID = 549;
        break;
      case EmailConstants.USER_OWN_NOTES_EMAIL:
        options.categories = ["own_notes"];
        options.asmGroupID = 777;
        break;
      case EmailConstants.TRENDING_TIPS_TEMPLATE_ID:
        options.categories = ["trending_tips"];
        options.asmGroupID = 549;
        break;
      case EmailConstants.WEEK_AHEAD_TEMPLATE_ID:
        options.categories = ["week_ahead"];
        options.asmGroupID = 549;
        break;
      case EmailConstants.ALMOST_THERE_TEMPLATE_ID:
        options.categories = ["almost_there"];
        options.asmGroupID = 549;
        break;
      case EmailConstants.SINGLE_TIP_TEMPLATE_ID:
        options.categories = ["new_tips"];
        options.asmGroupID = 543;
        break;
    }
    UserAlertsManager.sendEmailToUidsWithOptions(uids, options)
      .then((sendData)=> {
        res.success(sendData);
      }).catch((error)=> {
      res.fail("SYSTEM_ERROR", error);
    });
  });

  app.post('/:version/notifications/digest/send', (req, res)=> {
    "use strict";
    var uids = req.body.uids;
    var ids = req.body.ids;
    var templateId = req.body.templateId;
    var subject = req.body.subject ? req.body.subject : "Tips Digest";
    var intro = req.body.intro ? req.body.intro : "Highlights from your recent Swellist tipsri.";
    var digestObjects = [];
    async.each(ids, (id, callback)=> {
      var idSplit = id.split(":");
      var tipUid = idSplit[0];
      var tipId = Number(idSplit[1]);
      UserActivityStreamManager.getUserActivityObjectData(tipUid, tipId).then(function (result) {
        digestObjects.push(result);
        callback()
      }, function (err) {
        callback(err);
      });
    }, (error)=> {
      if (error) {
        res.fail("DIGEST_ERROR", error);
      } else {
        var optionsArray = [];
        for (var i = 0; i < digestObjects.length; i++) {
          var frameName = "%framing" + i + "%";
          var framing = digestObjects[i].framing;
          var titleName = "%title" + i + "%";
          var title = digestObjects[i].title;
          var imageName = "%imageUrl" + i + "%";
          var imageUrl = digestObjects[i].images[0].url;
          var textName = "%text" + i + "%";
          var text = digestObjects[i].text;
          var textArray = text.split(" ");
          if (textArray.length > 28) {
            var dots = "...";
            text = textArray.slice(0, 26).join(" ").concat(dots);
          }
          optionsArray.push ({
            [frameName]: framing,
            [titleName]: title,
            [imageName]: imageUrl,
            [textName]: text
          })
        }
        optionsArray.push ({ "%intro%": intro });
        var substitutions = Object.assign.apply(Object, optionsArray);
        var options = {
          categories: ['digest'],
          substitutions: substitutions,
          templateId: templateId,
          asmGroupID: 775,
          subject: subject
        };
        console.log(options);
        UserAlertsManager.sendEmailToUidsWithOptions(uids, options).then((sendData)=> {
          res.success(sendData);
        }).catch((error)=> {
          if (err == 'fail') {
            res.fail("DIGEST_ERROR", error)
          } else {
            res.error(err);
          }
        }); //AlertsManager
      }
    }); //async
  }); //post

};
