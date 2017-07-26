var React = require('react')

var UserDashboardOnboardingPaymentView = React.createClass({
  getInitialState: function() {
    return {
      "number": "",
      "exp_month":"",
      "exp_year":"",
      "cvc": "",
      "errorMessage": "",
      "isLoading": false
    }
  },
  onCardNumberChange: function(event) {
    this.setState({"number":event.target.value});
  },
  onExpirationChange: function(event) {
    var expiration_date = event.target.value.split("/");
    if(expiration_date[0] && expiration_date[0].length <= 2) {
      this.setState({"exp_month": expiration_date[0]});
    }

    if(expiration_date[1] && expiration_date[1].length <= 2) {
      this.setState({"exp_year": expiration_date[1]});
    }
  },
  onCVCChange: function(event) {
    this.setState({"cvc":event.target.value});
  },
  handleSubmit: function(event) {
    event.preventDefault();
    this.setState({"isLoading": true});
    Stripe.card.createToken(this.state, (status, response)=>{
      this.setState({"isLoading": false});
      if(status == 200) {
        this.props.apiUtils.saveStripeCustomer(response.id, this.props.uid, (error, response)=>{
          if(error) {
            this.setState({"errorMessage": error.message});
          }
          if(response.success === true) {
            this.props.handleViewComplete();
          } else {
            this.setState({"errorMessage": response.message});
          }
        });
      } else {
        if(response && response.error && response.error.message) {
          this.setState({"errorMessage": response.error.message});
        }
      }
    });
  },
  render: function() {
    return (
      <div className="profile payment-view">
        <div className="container">
          <h6 className="form-signin-heading text-center">JOIN SWELLIST TODAY</h6>
          <p className="text-center" style={{"margin": "32px auto 0px"}}>First month free, $100/month after</p>
          <div className="payment-view-container">
            <div className="payment-view-column" style={{"width": "40%"}}>
              <i className="fa fa-lock" style={{"marginRight": "4px"}}></i>
              <span>Security Socket Layer (SSL) encrypted payment</span>

              <input type="text" className="payment-view-input" onChange={this.onCardNumberChange} value={this.state.number} placeholder="Credit Card Number" />
              <input type="text" className="payment-view-input" onChange={this.onExpirationChange} placeholder="Exp. (MM / YY)" />
              <input type="text" className="payment-view-input" onChange={this.onCVCChange} value={this.state.cvc} placeholder="CVC" />

              <img src="/images/swellist/payment.jpg" style={{"width": "100%", "marginTop": "24px"}} />
            </div>
            <div className="payment-view-column" style={{"width": "20%"}}>&nbsp;</div>
            <div className="payment-view-column"  style={{"width": "40%"}}>
              <div className="payment-view-summary">
                <div className="payment-view-summary-inner">
                  <h5>Summary</h5>
                  <ul>
                    <li>An on-call personal concierge</li>
                    <li>1 month free trial</li>
                    <li>100% money-back guarantee</li>
                    <li>$100/month after free trial</li>
                  </ul>
                </div>
                <div className="payment-view-amount">
                  <b>Amount Due:</b>
                  <div style={{"float": "right"}}>$0.00</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center" style={{"display": "flex", "width":"100%"}}>
            <input type="submit" value="Submit" onClick={this.handleSubmit} disabled={this.state.isLoading} className="payment-view-submit" />
          </div>
          <div className="text-center" style={{"display": "flex", "width":"100%"}}>
            <p style={{"color": "#F00", "textAlign": "center", "width": "100%"}}>{this.state.errorMessage}</p>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = UserDashboardOnboardingPaymentView;
