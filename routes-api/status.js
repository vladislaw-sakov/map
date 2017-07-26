/** Routes to test system status */

module.exports = function( app, express ) {
    app.get('/checkme', function(req, res) {
       res.success({status: "ok"});
    });

    app.get('/wUqGCYVw.html', function(req, res) {
      res.send('wUqGCYVw');
    })
}
