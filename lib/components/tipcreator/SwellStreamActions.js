var AppDispatcher = require('../../dispatcher/AppDispatcher.js')
    , SwellAdminAPIUtils = require('../../components/admin/SwellAdminAPIUtils.js')
    , SwellStreamConstants = require('../../constants/swell/SwellStreamConstants.js')
    ;

var apiUtils = new SwellAdminAPIUtils();

var SwellStreamActions = {
    fetchUserStream() {
        apiUtils.fetchUserStream();
    },

    selectStreamObject(streamObject) {
        AppDispatcher.dispatch({
            actionType: SwellStreamConstants.SELECT_STREAM_OBJECT,
            streamObject: streamObject
        });
    },

    clearStreamObjectSelection() {
        AppDispatcher.dispatch({
            actionType: SwellStreamConstants.CLEAR_STREAM_OBJECT_SELECTION,
        });
    }
};

module.exports = SwellStreamActions;
