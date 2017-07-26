var CampaignConstants = require('../constants/CampaignConstants.js')
;

module.exports.getBaseCampaignKey = function(campaign) {
  if(!campaign) {
    return;
  }
  var campaignNormalized = campaign.toLowerCase();
  if(campaignNormalized.indexOf(CampaignConstants.GOAL_RUNNING)>-1) {
    return CampaignConstants.GOAL_RUNNING;
  }
  if(campaignNormalized.indexOf(CampaignConstants.GOAL_PRODUCTIVITY)>-1) {
    return CampaignConstants.GOAL_PRODUCTIVITY;
  }
  return campaign;
}
