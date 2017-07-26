var React = require('react')
, SwellStreamStore = require('../../store/swell/SwellStreamStore_v2.js')
, UserDashboardActions = require('../../actions/dashboard/UserDashboardActions.js')
, TipView = require('./tipviews/TipView.jsx')
, ReactPullToRefresh = require('react-pull-to-refresh')
;

var UserDashboardFeedContainerView = React.createClass({
  getInitialState: function () {
    return getState();
  },
  componentDidMount: function () {
    SwellStreamStore.addChangeListener(this._onChange);
    UserDashboardActions.fetchStream();
  },
  componentWillUnmount: function () {
    SwellStreamStore.removeChangeListener(this._onChange);
  },
  _onChange: function () {
    this.setState(getState());
  },
  getTipViews: function() {
    var result = [];
    var tips = SwellStreamStore.getStreamObjects();
    if (tips && tips.length > 0) {
      for (var i = 0; i < tips.length; i++) {
        var curStreamObject = tips[i];
        var tipView = <TipView streamObject={curStreamObject} key={"id-"+curStreamObject.id} uid={this.props.uid} tracker={this.props.tracker} email={this.props.email} />;
        if (tipView) {
          result.push(tipView);
        }
      }
    }
    return result;
  },

  handleRefresh: function (resolve, reject) {
    // do some async code here
    if ( true  ) {
      UserDashboardActions.fetchStream();
      resolve();
    } else {
      reject();
    }
  },

  render: function () {
    var tipViews = this.getTipViews();
    var hasTips = tipViews.length > 0;
    var tipsContent;
    if (this.state.isLoading) {
      tipsContent = (
        <div>
          <div className="fade-in" style={{display:"flex", alignItems: "center", justifyContent: "center", paddingTop: "100px", paddingBottom: "100px"}}>
            <img src="http://static.swellist.com/images/swellist-circle-loader.gif"
                 style={{width:"100px", height:"100px"}}/>
          </div>
        </div>

      );
    } else if (!hasTips) {
      tipsContent = (
        <div className="Iip-view">
          <div className="Tip-column">
            <div className="zero-state tipBox">
            <p><img alt="welcome" src="http://static.swellist.com/images/feed/welcome4.gif" style={{"height":"192px", "width":"354px"}} /></p>
            </div>
          </div>
        </div>
      );
    } else {
      tipsContent = (
        <div className="Iip-view">
          <div className="Tip-column">            
            <ReactPullToRefresh onRefresh={this.handleRefresh} className="your-own-class-if-you-want" style={{textAlign: 'center'}}>
              {tipViews}
            </ReactPullToRefresh>
          </div>
        </div>
      );
    }
    return (
      <div className="FeedBox">
        <div className="Feed-container">
          <div className="Container">
            {tipsContent}
            <div className="end-of-feed"><img alt="end-of-feed" src="/images/swellist/end-of-feed-3x.png"></img></div>
          </div>
        </div>
      </div>
    );
  }
});


function getState() {
  return {
    isLoading: SwellStreamStore.isLoading()
  }
}

module.exports = UserDashboardFeedContainerView;
