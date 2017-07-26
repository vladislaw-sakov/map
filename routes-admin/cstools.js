/**
 * Created by robby on 7/27/15.
 */

var UserPasswordManager = require('../lib/managers/UserPasswordManager')
    , JobManager = require('../lib/managers/JobManager')
    , DataManager = require('../lib/managers/DataManager')
    , UserManager = require('../lib/managers/UserManager')
    , TableConsts = require('../lib/constants/TableConsts.js');

module.exports = function( app, express ) {

    app.get( '/cstools', function( req, res ) {
        var email = req.user;
        UserPasswordManager.checkUserRole(email, function( err, role ) {
            return role != "admin" ? res.send(500) : res.render('admin-cstools', {});
        });
    });

    app.get('/cstools/user/:uid', function( req, res ) {
        var email = req.user;
        var uid = req.params.uid;
        UserPasswordManager.checkUserRole(email, function( err, role ) {
            return role != "admin" ? res.send(500) : res.render('admin-cstools-user', { uid: uid });
        });
    });

    app.post('/cstools/user/:uid/notifs', function( req, res ) {
        UserPasswordManager.checkUserRole(req.user, function( err, role ) {
            if( role != "admin" ) {
                res.send(500);
            }

            var isOn = req.body.isOn;
            var notifType = req.body.notifType;
            var uid = req.params.uid;

            UserManager.getUserObject( uid, function( err, user ) {
                user.setNotifPrefs( notifType, isOn );
                UserManager.saveUser( uid, user.getAttributes(), function( err, data ) {
                    if( err ) {
                        res.json( { success: false, error: err } );
                    } else {
                        res.json( { success: true } );
                    }
                });
            });
        });

    });

    app.post('/schedule/similartaskupload', function( req, res ) {
        UserPasswordManager.checkUserRole(req.user, function(err, role) {
            if (role != "admin") {
                return res.redirect('/');
            }

            var runAt = parseInt( req.body.upload_time );
            if( !runAt ) {
                runAt = Math.round(_.now() / 1000);
            }
            JobManager.createJob(runAt, 'uploadToCloudSearch', []);
            res.redirect('/cstools');
        });
    });

    app.post('/encrypttaskkey', function( req, res ) {
        var email = req._passport.session.user;
        UserPasswordManager.checkUserRole(email, function( err, role ) {
            if (role != "admin") {
                return res.send(500);
            } else {
                var taskKey = req.body.taskKey;
                var encrypted = UserPasswordManager.encrypt(taskKey);
                var link = env.current.vanity_url + "/w/" + encrypted;
                res.json({taskKey: taskKey, encrypted: encrypted, link: link});
            }
        });
    });

    app.post('/decrypttaskkey', function( req, res ) {
        var email = req._passport.session.user;
        UserPasswordManager.checkUserRole(email, function( err, role ) {
            if (role != "admin") {
                return res.send(500);
            } else {
                var encryptedKey = req.body.encryptedKey;
                var decrypted = UserPasswordManager.decrypt(encryptedKey);
                res.json({decrypted: decrypted});
            }
        });
    });

    app.post('/persistence/addadmin', function( req, res ) {
        var email = req._passport.session.user;
        UserPasswordManager.checkUserRole(email, function( err, role ) {
            if (role != "admin" && ('production' == app.get('env'))) {
                return res.send(500);
            }
            var creatorEmail = req.body.email;
            if( !creatorEmail ) {
                return res.send(500, {"message":"Bad creator email input."});
            }
            creatorEmail = creatorEmail.toLowerCase();
            creatorEmail = creatorEmail.trim();
            DataManager.putValueForKeyInTableNoCache( req.body.role, creatorEmail, TableConsts.AdminWhitelist, function( err, data ) {
                res.json( err || data );
            });
        });
    });

    app.post('/resetemail', function( req, res ) {
        var resetEmail = req.body.email;
        DataManager.getItemWithKeyInTable( resetEmail, TableConsts.UserId, function( err, uid ) {
            if( !uid ) {
                return res.send(500, {"message": "No UID found for email"});
            }

            DataManager.getItemWithKeyInTable( uid, TableConsts.UserEmail, function( err, email ) {
                if( email ) {
                    DataManager.deleteItem( TableConsts.UserEmail, uid );
                }
            });

            DataManager.deleteItem( TableConsts.UserId, resetEmail );

            res.send( 200 );
        });
    });
}
