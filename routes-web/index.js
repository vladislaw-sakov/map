var SessionManager = require('../lib/managers/SessionManager.js')
;

module.exports = function( app, express ) {
  app.get('/', function(req, res){
    var isProd = process.env.NODE_ENV == 'production';

    function renderIndex() {
      res.render( 'swellist-landing' ,{
        isProd: isProd
      });
    }

    if( req.cookies && req.cookies.token ) {
      var token = req.cookies.token;
      SessionManager.verify( token, function( err, data ) {
        if( !err ) {
          return res.redirect('/dashboard');
        }
        renderIndex();
      });
    } else {
      renderIndex();
    }
  });

  app.get('/dashboard', function( req, res ) {
    var message = "";
    if(req.session.message) {
      message = req.session.message;
      delete req.session.message;
    }
    var params = {
        "apiURL": env.current.api_base_url,
        "wunderlistClientId": env.current.wunderlist.client_id,
        "sentryDSN": env.current.sentry.DSN,
        "sentryPath": env.current.sentry.path,
        "stripePublishableKey": env.current.stripe.publishableKey,
        "userDashboardMessage": message
    };
    res.render('swellist-dashboard', params);
  });

  app.get('/landing', function( req, res ) {
    res.render('swellist-landing');
  });

  app.get( '/terms', function( req, res ) {
    res.render( 'swellist-terms', {
      "productName": "Swellist"
    });
  });
  app.get('/swellist', function( req, res ) {
    res.render('swellist-landing');
  });
  app.get('/faqs', function( req, res ) {
    res.render('swellist-faq');
  });
  app.get('/what', function( req, res ) {
    res.render('swellist-what');
  });
  app.get('/how', function( req, res ) {
    res.render('swellist-how');
  });
  app.get('/howitworks', function( req, res ) {
    res.render('swellist-how');
  });
  app.get('/learnmore', function( req, res ) {
    res.render('swellist-how');
  });
  app.get('/pricing', function( req, res ) {
    res.render('swellist-pricing');
  });
  app.get('/example', function( req, res ) {
    res.render('swellist-example');
  });
  app.get('/team', function( req, res ) {
    res.render('swellist-team');
  });
  app.get('/checkme', function(req, res) {
    res.success({status: "ok"});
  });
};
