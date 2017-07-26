var UserPasswordManager = require('../lib/managers/UserPasswordManager')
    , moment = require('moment')
    , _ = require('underscore')
    , passport = require('passport');

module.exports = function( app, express ) {
    app.get( '/login', function( req, res ) {
        res.render('admin-login');
    });
    app.get( '/role', function( req, res ) {
        UserPasswordManager.checkUserRole(req.user, function(err, role) {
            return res.json({"role": err || role});
        });
    });
    app.post( '/login',
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
        function( req, res ) {
            res.redirect('/');
        }
    );

    app.get( '/logout', function( req, res ) {
        req.logout();
        res.redirect('/login');
    });

    app.get( '/forgotpassword', function( req, res ) {
        res.render( 'admin-forgotpassword', { showform: true } );
    });

    app.post( '/forgotpassword', function( req, res ) {
        var email = req.body.email;
        UserPasswordManager.checkUserRole(email, function(err, role) {
            if(err || !role) {
                return res.render( 'admin-forgotpassword', { error: true, errorText: "invalid" } );
            }
            var baseUrl = env.current.admin_url;
            UserPasswordManager.resetAdminUserPassword( req.body.email, baseUrl, function( err, data ) {
                if( err ) {
                    res.render( 'admin-forgotpassword', { error: true, errorText: "invalid" } );
                } else {
                    res.render( 'admin-forgotpassword', { showsuccess: true, message: data.message } );
                }
            });
        });
    });

    app.get( '/resetpassword' , function( req, res ) {
        var email = req.query.email;
        var token = req.query.token;
        UserPasswordManager.checkUserTotp( email, token, function( err, isVerified ) {
            if( isVerified ) {
                req.logIn( email, function( err ) {
                    res.render( 'admin-forgotpassword', { changepassword: true, email: email, token: token } );
                });
            } else {
                res.redirect('/login');
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
                    UserPasswordManager.addAdminPassword(email, password, function (err, data) {
                        res.redirect('/');
                    });
                } else {
                    return res.send( {error: true, errorText: "invalid" } );
                }
            });
        });

    });
}
