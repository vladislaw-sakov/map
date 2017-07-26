var DataManager = require('./DataManager')
, TableConsts = require('../constants/TableConsts.js')
, Slack = require('node-slack')
, moment = require('moment')
, async = require('async')
, _ = require('underscore')
, ScheduledTipsManager = require('./ScheduledTipsManager')
, UserActivityStreamManager = require('./UserActivityStreamManager')
, NotesManager = require('./NotesManager')
, LogManager = require('./LogManager.js')
;

var STATUSES = {"NEVER_RUN" : "0", "IN_PROGRESS" : "1", "FAILED" : "2", "SUCCEEDED" : "3"};
var FAILURE_LIMIT = "5";
var JOB_LIMIT = 15;
var ONE_DAY = 86400;
var TWO_MINUTES = 120;

function now() {
  return (Math.floor(_.now() / 1000)).toString();
}
module.exports.STATUSES = STATUSES;

module.exports.createJob = function (runAt, service, params, status, lastUpdate, failureCount) {
  status = status || STATUSES.NEVER_RUN;  
  lastUpdate = lastUpdate || now();
  failureCount = failureCount || '0';
  DataManager.getNewId('Job', function( err, newJobId ) {
    if( err ) {
      return LogManager.logError("Problem getting new job id.", err);
    }
    var item = {};
    item['key'] = {'N' : newJobId.toString()}
    item['run_at'] = {'N' : runAt.toString()};
    item['status'] = {'N' : status};
    item['failure_count'] = {'N' : failureCount};
    item['last_update'] = {'N' : lastUpdate};
    item['service'] = {'S' : service};
    item['params'] = {'S' : JSON.stringify(params)};
    DataManager.putItem('Jobs', item);
  });
}
function doErrorScan() {
  var scanFilters = {
    "status": {AttributeValueList: [{"N": STATUSES.IN_PROGRESS}], ComparisonOperator: "EQ"},
    "run_at": {AttributeValueList: [{"N": (parseInt(now()) - 3600).toString()}], ComparisonOperator: "LT"}
  };
  DataManager.scan("Jobs", "ALL_ATTRIBUTES", scanFilters, null, function( err, jobs ) {
    if(jobs && jobs.Count > 0) { //there are jobs erring out
      var fromPrefix = env.name == 'production' ? '' : (env.name.toUpperCase() + ' ');
      var slack = new Slack( 'simplelabs', env.current.slack.key );
      slack.send({
        text: fromPrefix + "Scheduler Server trouble : " + jobs.Count + " unprocessed jobs.",
        channel: "#aws",
        username: "Simple Labs Deploy"
      });
    }
  });
}

function runJobs(callback, limit, status) {
  if(parseInt(now()) % 3600 > 0 && parseInt(now()) % 3600 < 30) { //run 1-2x an hour assuming running jobs every 20 secs
    doErrorScan();
  }
  limit = limit || JOB_LIMIT; //default limit of 50 jobs to process during a single run
  status = status || STATUSES.NEVER_RUN;
  var scanFilters = {
    "status": {AttributeValueList: [{"N": status}], ComparisonOperator: "EQ"},
    "run_at": {AttributeValueList: [{"N": now()}], ComparisonOperator: "LT"}
  };
  if(status == STATUSES.FAILED) { //retry jobs that haven't failed too often or been retried for one day
    scanFilters.failure_count = {AttributeValueList: [{"N": FAILURE_LIMIT}], ComparisonOperator: "LE"};
    scanFilters.last_update = {AttributeValueList: [{"N": (Number(now()) - ONE_DAY).toString()}], ComparisonOperator: "LT"};
  } else if (status == STATUSES.IN_PROGRESS) {
    scanFilters.last_update = {AttributeValueList: [{"N": (Number(now()) - TWO_MINUTES).toString()}], ComparisonOperator: "LT"};
  }
  console.log("About to call Data Manager.scan()");
  DataManager.scan("Jobs", "ALL_ATTRIBUTES", scanFilters, null, function( err, jobs ) {
    if(jobs && jobs.Count > 0) {
      console.log("Data Manager returned " + jobs.Count + " to process.");
      var jobsCompleted = 0;
      var amtUnderLimit = limit - jobs.Count;
      jobs = jobs.Items.slice(0, Math.min(jobs.Count, limit));
      async.eachSeries(jobs, function(job, localCallback) {
        runJob(job, localCallback);
      }, function(err) {
        amtUnderLimit > 0 && status != STATUSES.IN_PROGRESS ?
        runJobs(callback, amtUnderLimit, (status == STATUSES.FAILED ? STATUSES.IN_PROGRESS : STATUSES.FAILED)) :
        cleanupJobs(callback);
      });
    } else {
      status == STATUSES.IN_PROGRESS ? cleanupJobs(callback) : runJobs(callback, limit, STATUSES.IN_PROGRESS);
    }
  });
}
function cleanupJobs(callback) {
  var scanFilters = { //purge jobs that have been in the system 8 days no matter what the status
    "last_update": {AttributeValueList: [{"N": (Number(now()) - (8*ONE_DAY)).toString()}], ComparisonOperator: "LT"}
  };
  DataManager.scan("Jobs", "ALL_ATTRIBUTES", scanFilters, null, function( err, jobs ) {
    deleteResults(jobs, function() {
      scanFilters = { //purge jobs that have failed too many times
        "failure_count": {AttributeValueList: [{"N": FAILURE_LIMIT}], ComparisonOperator: "GT"}
      };
      DataManager.scan("Jobs", "ALL_ATTRIBUTES", scanFilters, null, function( err, jobs ) {
        deleteResults(jobs, function() {
          scanFilters = { //purge successful jobs older than 1 day
            "last_update": {AttributeValueList: [{"N": (Number(now()) - (ONE_DAY * 4)).toString()}], ComparisonOperator: "LT"},
            "status": {AttributeValueList: [{"N": STATUSES.SUCCEEDED}], ComparisonOperator: "EQ"}
          };
          DataManager.scan("Jobs", "ALL_ATTRIBUTES", scanFilters, null, function( err, jobs ) {
            deleteResults(jobs, function() {
              DataManager.putItem('JobCount', {"key": {"S": "jobs_processed_at"}, "value": {"N": String(Math.round(_.now() / 1000))}});
              console.log('Jobs cleaned.  All done.');
              callback();
            });
          });
        });
      });
    });
  });
}

function getJobsForStatus(status) {
  return new Promise((fulfill, reject)=>{
    var scanFilters = {
      "status": {AttributeValueList: [{"N": status.toString()}], ComparisonOperator: "EQ"}
    };
    DataManager.scan("Jobs", "ALL_ATTRIBUTES", scanFilters, null, function( err, jobs ) {
      if(err) {
        reject(err);
      } else if( !jobs || jobs.Count == 0 ) {
        fulfill(null);;
      } else {
        fulfill(jobs.Items);
      }
    });
  });
}
module.exports.getJobsForStatus = getJobsForStatus;

function getJobWithId(jobId, runAt) {
  return new Promise((fulfill, reject)=>{
    var key = {
        'key': {
            'N': jobId.toString()
        },
        'run_at': {
          'N': runAt.toString()
        }
    };
    DataManager.getItem(key, TableConsts.Jobs, (error, job)=> {
      if(error) {
        reject(error);
      } else {
        fulfill(job);
      }
    });
  });
}
module.exports.getJobWithId = getJobWithId;

function retryHungJobs() {
  getJobsForStatus(STATUSES.IN_PROGRESS).then((jobs)=>{
    if(jobs) {
      for(job of jobs) {
        setJobHung(job);
      }
    }
  });
}
module.exports.retryHungJobs = retryHungJobs;

function setJobIdStatus(jobId, status) {
  return new Promise((fulfill, reject)=>{
    var params = {
      TableName: "Jobs",
      Select: 'ALL_ATTRIBUTES',
      KeyConditions: {
        "key": {"ComparisonOperator": "EQ", "AttributeValueList": [{"N": jobId.toString() }]}
      }
    };
    DataManager.query( params, null, ( err, data )=>{
      var job = data.Items[0];
      job.status = {"N": status.toString()};
      DataManager.putItem("Jobs", job, (err, putData)=>{
        if( err ) {
          reject(err);
        } else {
          fulfill(job);
        }
      });
    });
  });
}
module.exports.setJobIdStatus = setJobIdStatus;

function deleteResults(jobs, callback) {
  if(jobs && jobs.Count > 0) {
    async.eachSeries(jobs.Items, function(job, localCallback){
      DataManager.deleteJob(job.key.N, job.run_at.N, localCallback);
    }, function(err) {
      callback();
    });
  } else {
    callback();
  }
}
function runJob(job, callback) {
  job.status.N = STATUSES.IN_PROGRESS;
  job.last_update.N = now();
  DataManager.putItem("Jobs", job, function( err, dynReturnData) {
    console.log("Job " + job.key.N + ": running " + job.service.S + (err || " in progress and saved") + " at " + moment().toISOString());
    if(!err) {
      var paramsArr = JSON.parse(job.params.S);
      var params = paramsArr.concat([job, onJobSuccess, onJobFailure, callback]);
      var service = locateService(job.service.S);
      if( service && service.function ) {
        var serviceFunction = service.function
        var thisArg = service.thisArg || {};
        serviceFunction.apply(thisArg, params); //run service
      } else {
        onJobFailure(job, new Error("Missing service: " + job.service.S), callback);
      }
    } else if(callback) {
      onJobFailure(job, err, callback);
    }
  });
}
module.exports.runJob = runJob;
function setJobHung(job, err, callback) {
  job.status.N = STATUSES.NEVER_RUN;
  job.last_update.N = now();
  job.failure_count.N = (Number(job.failure_count.N) + 1).toString();
  console.log("Job " + job.key.N + " hung " + job.service.S + " at " + moment().toISOString());
  persistJob(job, callback);
}
function onJobFailure(job, err, callback) {
  job.status.N = STATUSES.FAILED;
  job.last_update.N = now();
  job.failure_count.N = (Number(job.failure_count.N) + 1).toString();
  console.log("Job " + job.key.N + " failed running " + job.service.S + " at " + moment().toISOString());
  persistJob(job, callback);
}
function onJobSuccess(job, response, callback) {
  job.status.N = STATUSES.SUCCEEDED;
  job.last_update.N = now();
  console.log("Job " + job.key.N + " succeeded running " + job.service.S + " at " + moment().toISOString());
  persistJob(job, callback);
}
function persistJob(job, callback) {
  DataManager.putItem("Jobs", job, function( err, dynReturnData ) {
    if(err) {
      LogManager.logError("Persisting job failed", err);
    }
    console.log("Job " + job.key.N + " running " + job.service.S + ": " + (err || "saved") + " at " + moment().toISOString());
    if(callback) {
      callback(null, job);
    }
  });
}

/**
* Make sure that the functions used here participate in the success/failure callback system.
*
* @param service
* @returns {*}
*/
function locateService(service) {
  switch(service) {
    case "addSwellistTipById":
      return { "function": ScheduledTipsManager.addSwellistTipById };
      break;
    case "addSwellistTipsByBatchId":
      return { "function": ScheduledTipsManager.addSwellistTipsByBatchId };
      break;
    case "copyStreamObjectWithSourceUidIdToTargetUid":
      return { "function": ScheduledTipsManager.copyStreamObjectWithSourceUidIdToTargetUid };
      break;
    case "runNoteEmailJob":
      return { "function": NotesManager.runNoteEmailJob, "thisArg": NotesManager };
      break;
    case "publishActivityStream":
      return { "function": UserActivityStreamManager.publishActivityStream };
      break;
  }
}

module.exports.runJobs = runJobs;

module.exports.runJobAlarmCheck = function(callback) {
  DataManager.getItemWithKeyInTableNoCache('jobs_processed_at', TableConsts.JobCount, function(err, lastRun) {
    callback(null, (Math.round(_.now()/1000) - parseInt(lastRun)) > 300);
  });
}
