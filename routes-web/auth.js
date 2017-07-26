var UserPasswordManager = require('../lib/managers/UserPasswordManager.js')
;

module.exports = function(app, express) {
  app.get( '/forgotpassword', function( req, res ) {
    res.render( 'swellist-forgotpassword', { showform: true } );
  });

  app.post( '/forgotpassword', function( req, res ) {
    var baseUrl = env.current.vanity_url;
    UserPasswordManager.resetUserPassword( req.body.email, baseUrl, function( err, data ) {
      if( err ) {
        console.log(err.message);
        res.render( 'swellist-forgotpassword', { error: true, message: "invalid" } );
      } else {
        res.render( 'swellist-forgotpassword', { showsuccess: true } );
      }
    });
  });

  app.get( '/resetpassword' , function( req, res ) {
        var email = req.query.email;
        var token = req.query.token;
        UserPasswordManager.checkUserTotp( email, token, function( err, isVerified ) {
            if( isVerified ) {
                req.logIn( email, function( err ) {
                    res.render( 'swellist-forgotpassword', { changepassword: true, email: email, token: token } );
                });
            } else {
                res.redirect('/forgotpassword');
            }
        });
    });

    app.post( '/changepassword', function( req, res ) {
        var email = req.body.email;
        UserPasswordManager.checkUserRole(email, function(err, role) {
            if(err || !role)
                return res.send({ error: true, errorText: "invalid" });
            var token = req.body.token;
            UserPasswordManager.checkUserTotp( email, token, function( err, isVerified ) {
                var password = req.body.pass;
                if( isVerified ) {
                    UserPasswordManager.addUserPassword(email, password, function (err, data) {
                        res.redirect('/dashboard#/login');
                    });
                } else {
                    return res.send( {error: true, errorText: "invalid" } );
                }
            });
        });

    });
}
