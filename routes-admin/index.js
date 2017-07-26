var DataManager = require('../lib/managers/DataManager');
var UserPasswordManager = require('../lib/managers/UserPasswordManager');

module.exports = function( app, express ) {
  app.get( '/', function( req, res ) {
    UserPasswordManager.checkUserRole(req.user, function(err, role) {
      switch(role) {
        case "admin":
        case "supervisor":
          res.redirect('/admin');
          break;
        case "taskmaster":
        case "creator":
          res.redirect('/dashboard');
          break;
        case "training":
          res.redirect('/training/steps/1');
          break;
        default :
          res.redirect('/login');
      }
    });
  });

  app.get( '/checkme', function( req, res ) {
    res.json( {success: true});
  });

  app.get('/admin', function( req, res ) {
    UserPasswordManager.checkUserRole(req.user, function(err, role) {
      (role == "admin" || role == "supervisor") ? res.render('admin-signups-embed') :  res.send(500);
    });
  });
}
