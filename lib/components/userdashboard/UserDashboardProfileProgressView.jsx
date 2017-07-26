var React = require('react')
    , SwellUserStore = require('../../store/swell/SwellUserStore.js')
    , CampaignConstants = require('../../constants/CampaignConstants.js')
    , CampaignUtilities = require('../../utilities/CampaignUtilities.js')
    ;

var UserDashboardProfileProgressView = React.createClass({
    handleStartQuizClick: function(event) {
        event.preventDefault();
        // TODO: Pull these from typeform-config.json
        var baseTypeformLink = "https://swellist.typeform.com/to/";
        var quizId = "SUmjGU";
        switch(CampaignUtilities.getBaseCampaignKey(SwellUserStore.getCampaign())) {
          case CampaignConstants.GOAL_RUNNING:
            quizId = "gWR1pk"
            break;
          case CampaignConstants.GOAL_PRODUCTIVITY:
            quizId = "PGIqo7";
            break;
          default:
            break;
        }
        var typeformLink = baseTypeformLink + quizId + "?uid="+SwellUserStore.getUid()+"&email="+SwellUserStore.getEmail();
        location.href = typeformLink;
    },
    render: function () {

        return (
            <div className="Progress-view">
                <div className="Progress-header">
                    <h6>Getting to know you better</h6>
                </div>
                <div className="Progress-next-action">
                    <div className="Progress-next-text">
                        <p>Swellist strives to provide you with the most useful information possible.  Advanced preferences quizzes gather the relevant details about your individual tastes.</p>
                        <p>So whether you are a vegetarian or paleo, shop for convenience or price, these quizzes allow Swellist to deliver the best content for you.</p>
                    </div>
                </div>
                <div className ="Profile-quiz SettingsTable">
                    <div className="Settings-field">
                        <div className="Settings-copy profile-copy">
                            Personalization Quiz
                        </div>
                        <button className="sync-button" onClick={this.handleStartQuizClick}>Go</button>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = UserDashboardProfileProgressView;
