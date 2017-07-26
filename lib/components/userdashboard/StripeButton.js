var React = require('react')
, ReactScriptLoaderMixin = require('react-script-loader').ReactScriptLoaderMixin
, SimpleRequest = require('../../utilities/SimpleRequest.js')
, simpleRequest = new SimpleRequest()
;

var StripeButton = React.createClass({
    mixins: [ReactScriptLoaderMixin],
    getScriptURL: function() {
        return 'https://checkout.stripe.com/checkout.js';
    },

    statics: {
        stripeHandler: null,
        scriptDidError: false
    },

    // Indicates if the user has clicked on the button before the
    // the script has loaded.
    hasPendingClick: false,

    processToken: function(token, args) {
        var payload = {};
        console.log(`token: ${JSON.stringify(token)}`);
        payload.billingAddress = {
            name: args.billing_name,
            street: args.billing_address_line1,
            city: args.billing_address_city,
            state: args.billing_address_state,
            zip: args.billing_address_zip,
            country: args.billing_address_country
        }
        payload.token = token.id;
        payload.email = token.email;

        var url = `${API_URL}/v1/user/${this.props.uid}/payments`;
        simpleRequest.post(url, payload, (error, response)=>{
          if(error) {
            console.log(error);
          }
          if(response) {
            console.log(response);
          }
        });
    },

    onScriptLoaded: function() {
        // Initialize the Stripe handler on the first onScriptLoaded call.
        // This handler is shared by all StripeButtons on the page.

        var self = this;
        var stripeKey = "pk_test_p2z3SdlShganZ9GXhifsDDJZ";
        if(typeof STRIPE_KEY !== 'undefined' && STRIPE_KEY !== '') {
          stripeKey = STRIPE_KEY;
        }
        if (!StripeButton.stripeHandler) {
            StripeButton.stripeHandler = StripeCheckout.configure({
                "key": stripeKey,
                "image": 'http://static.swellist.com/images/Swellist-Circle.png',
                "name": this.props.name,
                "billingAddress": true,
                "token": function(token, args) {
                    self.processToken(token, args);
                }
            });
            if (this.hasPendingClick) {
                this.showStripeDialog();
            }
        }
    },
    showLoadingDialog: function() {
        // show a loading dialog
    },
    hideLoadingDialog: function() {
        // hide the loading dialog
    },
    showStripeDialog: function() {
        this.hideLoadingDialog();
        StripeButton.stripeHandler.open({
            name: this.props.name,
            description:  this.props.description,
            amount: this.props.amount
        });
    },
    onScriptError: function() {
        this.hideLoadingDialog();
        StripeButton.scriptDidError = true;
    },
    onClick: function() {
        // $.ajax({
        //     url: '/tip/' + TIP_HASH + '/track/Web_ProductDetail_Buy_Click',
        //     type: "POST",
        //     success: function(response) {
        //         console.log(response);
        //     }
        // });
        if (StripeButton.scriptDidError) {
            console.log('failed to load script');
        } else if (StripeButton.stripeHandler) {
            this.showStripeDialog();
        } else {
            this.showLoadingDialog();
            this.hasPendingClick = true;
        }
    },
    render: function() {
        return (
            <button onClick={this.onClick} className="buy-button">{this.props.buttonCopy}</button>
        );
    }
});

module.exports = StripeButton;
