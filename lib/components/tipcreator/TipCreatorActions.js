var AppDispatcher = require('../../dispatcher/AppDispatcher.js')
  , SwellStreamConstants = require('../../constants/swell/SwellStreamConstants.js')
  , SwellAdminAPIUtils = require('../../components/admin/SwellAdminAPIUtils.js')
  , TipCreatorConstans = require('../../constants/TipCreatorConstants.js')
  , SwellStreamActions = require('./SwellStreamActions.js')
  ;

var apiUtils = new SwellAdminAPIUtils();

var TipCreatorActions = {
  setCreatorFormType: function (formType) {
    AppDispatcher.dispatch({
      actionType: TipCreatorConstans.SET_CREATOR_FORM_TYPE,
      formType: formType
    });
  },
  scrapeLink: function (link) {
    AppDispatcher.dispatch({
      actionType: TipCreatorConstans.SCRAPE_LINK_STARTED,
      link: link
    });
    apiUtils.scrapeLink(link);
  },
  previewTip: function (streamObject) {
    AppDispatcher.dispatch({
      actionType: SwellStreamConstants.PREVIEW_STREAM_OBJECT,
      streamObject: streamObject
    });
  },
  createTip: function (streamObject, options) {

    if(options.sendOptions.publishDate) {
      streamObject.publishDate = options.sendOptions.publishDate;
    }

    apiUtils.createStreamObject(streamObject, options).then((res) => {
      if(res.data) {
        streamObject.id = eval(res.data.id);
        streamObject.lastUpdate = eval(res.data.lastUpdate);

        AppDispatcher.dispatch({
          actionType: SwellStreamConstants.CREATE_STREAM_OBJECT,
          streamObject: streamObject
        });
        
        if (options.shouldSendTipCreateNotification && !(streamObject.publishDate)) {
          options.sendOptions.substitutions["%tipId%"] = [res.data.id];

          apiUtils.sendSingleTipNotification(options.sendOptions);
        }
      }

      if(res.success == true) {
        if(streamObject.publishDate) {
          alert("Your tip was scheduled to be published successfully");
        }

        SwellStreamActions.clearStreamObjectSelection();
      }
    });

  },
  copyStreamObjectWithSourceUidIdToTargetUids: function (sourceUid, sourceObjectId, targetUids, options) {
    apiUtils.copyStreamObjectWithSourceUidIdToTargetUids(sourceUid, sourceObjectId, targetUids, options);
  },
  sendTipCreateNotification: function (options) {
    apiUtils.sendTipCreateNotification(options);
  },
  sendTipDigest: function (digestObject) {
    apiUtils.sendTipDigest(digestObject);
  },
  sendSingleTipNotification: function (options) {
    apiUtils.sendSingleTipNotification(options);
  },
  updateTip: function (streamObject, options) {
    AppDispatcher.dispatch({
      actionType: SwellStreamConstants.UPDATE_STREAM_OBJECT,
      streamObject: streamObject
    });
    apiUtils.updateStreamObject(streamObject).then((res) => {
      if (options.shouldSendTipCreateNotification) {
        options.sendOptions.substitutions["%tipId%"] = res.data.id;
        apiUtils.sendSingleTipNotification(options.sendOptions);
      }
    });;
  },
  deleteTip: function (streamObject) {
    AppDispatcher.dispatch({
      actionType: SwellStreamConstants.DELETE_STREAM_OBJECT,
      streamObject: streamObject
    });
    apiUtils.deleteStreamObject(streamObject);
  }
};

module.exports = TipCreatorActions;
