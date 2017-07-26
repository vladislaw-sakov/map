/**
 * Created by robby on 2/22/16.
 */

var AppDispatcher = require('../../dispatcher/AppDispatcher')
    , UserDashboardOnboardingFlowConstants = require('../../constants/dashboard/UserDashboardOnboardingFlowConstants.js')
    ;

var UserDashboardOnboardingFlowActions = {
    setInitialState: function(initialState) {
        AppDispatcher.dispatch({
            "actionType": UserDashboardOnboardingFlowConstants.SET_INITIAL_STATE,
            "initalState": initialState
        });
    },
    performNextStep: function(nextStep) {
        AppDispatcher.dispatch({
            "actionType": UserDashboardOnboardingFlowConstants.PERFORM_NEXT_STEP,
            "nextStep": nextStep
        });
    },

    performNextStepComplete: function() {
        AppDispatcher.dispatch({
            "actionType": UserDashboardOnboardingFlowConstants.PERFORM_NEXT_STEP_COMPLETE
        });
    }
};

module.exports = UserDashboardOnboardingFlowActions;