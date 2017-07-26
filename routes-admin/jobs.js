var UserPasswordManager = require('../lib/managers/UserPasswordManager.js')
  , JobManager = require('../lib/managers/JobManager.js')
  ;

module.exports = function(app, express) {
  app.get('/jobs/dashboard', (req, res)=>{
    res.render('admin-jobs-dashboard');
  });
  app.post('/jobs/action', (req, res)=>{
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      }

      var methodName = req.body.action;
      if( methodName ) {
        if(typeof JobManager[methodName] == 'function') {
          eval("JobManager."+methodName+"()");
          res.send(200);
        }
      }

    });
  });

  app.get( '/jobs/status/:status', function( req, res ) {
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      }
      var status = req.params.status;
      JobManager.getJobsForStatus(status).then((jobs)=>{
        res.json(jobs);
      }).catch((error)=>{
        res.send(500, error);
      });
    });


  });
  app.post('/job/:jobid/status', function( req, res ) {
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      }
      var status = req.body.status;
      var jobId = req.body.jobId;
      JobManager.setJobIdStatus(jobId, status).then((result)=>{
        res.send(result);
      }).catch((error)=>{
        console.log(error);
        res.send(500);
      });
    });
  });
  app.put('/job/:jobId/action', (req, res)=>{
    var email = req._passport.session.user;
    UserPasswordManager.checkUserRole(email, function( err, role ) {
      if (role != "admin") {
        return res.send(500);
      }
      var jobId = req.params.jobId;
      var action = req.body.action;
      var runAt = req.body.runAt;
      switch( action ) {
        case "run":
          JobManager.getJobWithId(jobId, runAt).then((job)=>{
            JobManager.runJob(job, function(error, result){
              if(error) {
                console.log(error);
                res.send(500);
              } else {
                console.log(result);
                res.send(200);
              }
            });
          }).catch((error)=>{
            console.log(error);
            res.send(500);
          });
      }
    });
  });

}
