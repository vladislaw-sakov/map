/**
* Created by robby on 12/1/15.
*/

var AppDispatcher = require('../../dispatcher/AppDispatcher')
, EventEmitter = require('events').EventEmitter
, SwellAdminConstants = require('../../constants/admin/SwellAdminConstants.js')
;

var CHANGE_EVENT = 'change';

// maps quiz id to questionsMap and quizResponse objects
/**
*
* @type {{}}
* @private
*
* {
*    "quizId": {
*          "questionsMap": {
*              "questionId": "question string"
*          },
*          "quizResponse": {
*              "questionId": "answer string"
*          }
*     }
* }
*
*/
var _responseData = {};
var _questionAndAnswerMap = {};

var TypeformStore = Object.assign({}, EventEmitter.prototype, {

  /**
  *
  * @returns {{object mapping quizId to an object containing a questionsMap object and a quizReponse object.}}
  *
  * {
  *    "quizId": {
  *          "questionsMap": {
  *              "questionId": "question string"
  *          },
  *          "quizResponse": {
  *              "questionId": "answer string"
  *          }
  *     }
  * }
  */
  getResponseData: function() {
    return _responseData;
  },
  getQuestionAnswerPairs: function() {
    return _questionAndAnswerMap;
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register(function(action) {
  switch (action.actionType) {
    case SwellAdminConstants.RECEIVE_TYPEFORM_RESPONSE_DATA:
    receiveTypeformResponseData(action.typeformResponses);
    TypeformStore.emitChange();
    break;
  }
});

function receiveTypeformResponseData( responseData ) {
  _responseData = responseData;

  for( var quizId in responseData ) {

    var questionStrings = {};
    var answerStrings = {};
    var quizData = responseData[quizId];
    var answers = quizData.quizResponse ? quizData.quizResponse.answers : false;
    if( answers ) {
      for( var questionKey in answers ) {
        var keyParts = questionKey.split('_');
        if( keyParts[0] == 'list' ) {
          if( answers[questionKey] ) {
            if( answerStrings[keyParts[1]] ) {
              answerStrings[keyParts[1]] = answerStrings[keyParts[1]] + ", " + answers[questionKey];
            } else {
              answerStrings[keyParts[1]] = answers[questionKey];
            }
            questionStrings[keyParts[1]] = quizData.questionsMap[questionKey];
          }
        } else {
          answerStrings[questionKey] = answers[questionKey];
          questionStrings[questionKey] = answers[questionKey];
        }
      }
    }
    _questionAndAnswerMap[quizId] = {
      "questionStrings": questionStrings,
      "answerStrings": answerStrings
    };
  }
}

module.exports = TypeformStore;
