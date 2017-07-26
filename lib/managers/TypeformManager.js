/**
* Created by robby on 12/7/15.
*/

var jsonRequest = require('request-json')
, async = require('async')
, DataManager = require('./DataManager.js')
, DocumentManager = require('./DocumentManager.js')
, TableConsts = require('../constants/TableConsts.js')
, moment = require('moment')
, LogManager = require('./LogManager.js')
, TypeformResponseHandlerOnboarding = require('./typeform/TypeformResponseHandlerOnboarding.js')
, TypeformResponseHandlerOnboardingControl = require('./typeform/TypeformResponseHandlerOnboardingControl.js')
, TypeformResponseHandlerOnboardingRunning = require('./typeform/TypeformResponseHandlerOnboardingRunning.js')
, TypeformResponseHandlerOnboardingProductivity = require('./typeform/TypeformResponseHandlerOnboardingProductivity.js')
, TypeformResponseHandlerProfileControl = require('./typeform/TypeformResponseHandlerProfileControl.js')
, TypeformResponseHandlerProfileRunning = require('./typeform/TypeformResponseHandlerProfileRunning.js')
, TypeformResponseHandlerProfileProductivity = require('./typeform/TypeformResponseHandlerProfileProductivity.js')
, TypeformConstants = require('../constants/TypeformConstants.js')
;

function updateQuizById( quizId, callback ) {
  var typeformImportTimeKey = "lastTypeformImportTime_" + quizId;
  DataManager.getItemWithKeyInTableNoCache( typeformImportTimeKey, TableConsts.UserCount, (err, lastTypeformImportTimeStr)=>{
    var lastTypeformImportTime = 0;
    var curBatchLatest = 0;
    if( lastTypeformImportTimeStr ) {
      lastTypeformImportTime = parseInt(lastTypeformImportTimeStr);
    }
    var url = 'https://api.typeform.com/v1/form/'+ quizId +'?key=' + env.current.typeform.key + '&completed=true&since='+lastTypeformImportTime;
    var client = jsonRequest.createClient(url);
    client.get(url, function(err, response, body){
      if( err ) {
        //LogManager.logError("Error fetching typeform responses for quizId: " + quizId, err);
        return callback(err);
      }
      var message = "No responses for: " + quizId;
      var quizResponses = body.responses;
      if(!quizResponses || quizResponses.length < 1) {
        return callback(null, {"message": message});
      }

      async.map( quizResponses, function( quizResponse, mapCallback ) {
        var uid = quizResponse.hidden.uid;
        var dateRaw = quizResponse.metadata && quizResponse.metadata.date_submit ? quizResponse.metadata.date_submit : Math.round( _.now()/1000 );
        var dateSubmit = moment.utc(dateRaw).unix();
        if( dateSubmit > lastTypeformImportTime && dateSubmit > curBatchLatest ) {
          curBatchLatest = dateSubmit;
        }
        if( uid ) {
          var item = {
            "quizId":""+quizId,
            "uid": ""+uid,
            "dateSubmit": dateSubmit,
            "response": JSON.stringify( quizResponse )
          };
          if(!item.quizId || !item.uid) {
            console.log(`Missing required key ${JSON.stringify(item)}`);
            process.exit();
            return mapCallback();
          }

          DocumentManager.putDocumentInTable(item, TableConsts.TypeformResponses).then((putResponse)=>{
            mapCallback();
          }).catch((error)=>{
            mapCallback(error);
          });

          var typeformResponseHandler = getTypeformResponseHandlerForQuizId( quizId );
          if( typeformResponseHandler && typeof typeformResponseHandler.handleResponse == 'function' ) {
            typeformResponseHandler.handleResponse( quizResponse, {}, (err, data)=>{
              if(err) {
                console.log(err.message);
              }
              if(data){
                console.log(quizId + ": "+data);
              }
            });
          }

        } else {
          mapCallback();
        }
      }, function( err ) {
        if( callback ) {
          callback( err, quizResponses );
        }

        if( !err ) {
          if( curBatchLatest > lastTypeformImportTime ) {
            lastTypeformImportTime = curBatchLatest;
          }
          DataManager.putValueForKeyInTableNoCache( lastTypeformImportTime.toString(), typeformImportTimeKey, TableConsts.UserCount, (err, importTimeSaveData)=>{
            if( err ) {
              console.log(err);
            }
          });
        }
      });
    });
  });
}
module.exports.updateQuizById = updateQuizById;

function getTypeformResponsesForUid( uid, quizIds, callback ) {
  var result = {};
  async.each( quizIds, function(quizId, quizIdCallback) {
    getTypeformResponseForUidAndQuizId( uid, quizId, function( err, questionsAndAnswers ) {
      result[quizId] = questionsAndAnswers;
      quizIdCallback();
    });
  }, function(err) {
    if( callback ) {
      callback( err, result );
    }
  });
}
module.exports.getTypeformResponsesForUid = getTypeformResponsesForUid;

function getTypeformResponseForUidAndQuizId( uid, quizId, callback ) {
  var questionsMap = {};
  var quizResponse = {};
  var result = {
    "questionsMap": questionsMap,
    "quizResponse": quizResponse
  };
  async.parallel([
    function(callback0) {
      var url = 'https://api.typeform.com/v1/form/'+ quizId +'?key='+ env.current.typeform.key +'&completed=true&limit=1';
      var client = jsonRequest.createClient(url);
      client.get(url, function(err, response, body) {
        if( err ) {
          console.error( err );
        }
        if( !body ) {
          body = {}
        }
        var questions = body.questions;
        if (!questions) {
          questions = [];
        }
        for( var i = 0; i<questions.length; i++ ) {
          var question = questions[i];
          if( question.id && question.question ) {
            questionsMap[question.id] = question.question;
          }
        }
        callback0();
      });
    },
    function(callback1) {
      var params = {
        TableName: TableConsts.TypeformResponses,
        KeyConditions: {
          "quizId": { "ComparisonOperator": "EQ", AttributeValueList: [{"S": quizId}] },
          "uid": { "ComparisonOperator": "EQ", AttributeValueList: [{"S": uid}] }
        }
      };

      DataManager.query( params, null, function( err, data ) {
        var quizResponses = data.Items;
        if( !quizResponses ) {
          callback1();
        }

        if( quizResponses.length ) {
          var quizResponseItem = quizResponses[0];
          var rawResponse = quizResponseItem.response.S;
          if( rawResponse ) {
            try {
              result.quizResponse = JSON.parse( rawResponse );
            } catch( e ) {
              result.quizResponse = { "message": "Problem parsing: \n" + rawResponse };
            }
            callback1();
          }
        } else {
          callback1();
        }
      });
    }
  ], function(err) {
    if(callback) {
      callback( err, result );
    }
  });
}
module.exports.getTypeformResponseForUidAndQuizId = getTypeformResponseForUidAndQuizId;

function getTypeformResponseHandlerForQuizId( quizId ) {
  var result;
  switch( quizId ) {
    case TypeformConstants.QUIZ_ID_ONBOARDING:
      result = new TypeformResponseHandlerOnboarding();
      break;
    case TypeformConstants.QUIZ_ID_ONBOARDING_CONTROL:
      result = new TypeformResponseHandlerOnboardingControl();
      break;
    case TypeformConstants.QUIZ_ID_ONBOARDING_RUNNING:
      result = new TypeformResponseHandlerOnboardingRunning();
      break;
    case TypeformConstants.QUIZ_ID_ONBOARDING_PRODUCTIVITY:
      result = new TypeformResponseHandlerOnboardingProductivity();
      break;
    case TypeformConstants.QUIZ_ID_PROFILE_CONTROL:
      result = new TypeformResponseHandlerProfileControl();
      break;
    case TypeformConstants.QUIZ_ID_PROFILE_RUNNING:
      result = new TypeformResponseHandlerProfileRunning();
      break;
    case TypeformConstants.QUIZ_ID_ONBOARDING_PRODUCTIVITY:
      result = new TypeformResponseHandlerProfileProductivity();
      break;
  }
  return result;
}
