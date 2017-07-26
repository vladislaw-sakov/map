var DataManager = require('../lib/managers/DataManager')
, TableConsts = require('../lib/constants/TableConsts.js')
, UserPasswordManager = require('../lib/managers/UserPasswordManager');

module.exports = function( app, express ) {
  app.get( '/persistence', function( req, res ) {
    res.render( 'admin-persistence', {title:"Persistence Testing"});
  });

  app.post( '/persistence/post', function( req, res ) {
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin" && ('production' == app.get('env')) ) {
        return res.send(500);
      }
      if(req.body.delete == "delete") {
        var keyObj = {};
        keyObj[req.body.type] = (req.body.key).toString();
        DataManager.deleteItem(req.body.table, (req.body.key).toString());
        res.json("Item deleted");
      } else {
        DataManager.putValueWithTypeForKeyInTable( req.body.value, req.body.type, req.body.key, req.body.table, function( err, data ) {
          if( err )
          return res.json(err);
          DataManager.putValueForKeyInCache(req.body.value, req.body.key, req.body.table, null, function(err, data) {
            return res.json(err || data);
          });
        });
      }
    });
  });

  app.post( '/persistence/read', function( req, res ) {
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      }
      DataManager.getItemWithKeyInTable( req.body.key, req.body.table, function( err, data ) {
        if( err ) {
          res.json(err);
        } else {
          var obj = JSON.parse( data );
          res.json(obj);
        }
      });
    });
  });

  app.get( '/persistence/read/:table/:key', function( req, res ) {
    var table = req.params.table;
    var key = req.params.key;
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      }
      DataManager.getItemWithKeyInTable( key, table, function( err, data ) {
        if( err ) {
          res.json(err);
        } else {
          var obj;
          try {
            obj = JSON.parse( data );
          } catch( e ) {
            console.log( "json parse failed : " + data );
            obj = data;
          }
          res.json(obj);
        }
      });
    });
  });

  app.get( '/persistence/scan/:table', function( req, res ) {
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      }
      var table = req.params.table;
      dynamodb.scan({
        TableName: table
      }, function( err, data ) {
        if( err ) return res.json( err );
        return res.json( data );

      })
    });
  });

  app.get('/jsoneditor/:table/:key', function( req, res ) {
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      }
      var table = req.params.table;
      var key = req.params.key;
      DataManager.getItemWithKeyInTable( key, table, function( err, data ) {
        if( err ) {
          res.json(err);
        } else {
          var obj;
          try {
            obj = JSON.parse( data );
          } catch( e ) {
            console.log( "json parse failed : " + data );
            obj = data;
          }
          var dataStr = new Buffer(JSON.stringify( obj )).toString('base64');
          res.render( 'admin-jsoneditor', { "obj": dataStr, "table":table, "key":key } );
        }
      });
    });
  });

  app.put('/jsoneditor/:table/:key', function( req, res ) {
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      }
      var table = req.params.table;
      var key = req.params.key;
      var data = req.body;
      DataManager.putValueForKeyInTable( JSON.stringify(data), key, table, function( err, data ) {
        if( err ) {
          res.send( 500 );
        } else {
          res.send({});
        }
      })
    });
  });

  app.post('/runtime', function( req, res ) {
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      } else {
        for( var key in req.body ) {
          env.current.runtime[key] = req.body[key];
        }
        res.json({});
      }
    });
  });


}
