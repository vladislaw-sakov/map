var React = require('react')
, TypeformStore = require('../../store/TypeformStore.js')
, typeformConfig = require('../../managers/typeform/typeform-config.json')
, validator = require('validator')
;

var WunderlistDashboardTypeformView = React.createClass({
  getInitialState: function() {
    return {
      questionAndAnswersMap: TypeformStore.getQuestionAnswerPairs()
    }
  },
  componentDidMount: function() {
    TypeformStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    TypeformStore.removeChangeListener(this._onChange);
  },
  render: function () {
    var rows = [];
    function processQuizData( quizId, quizData ) {
      var answers = quizData.answerStrings ? quizData.answerStrings : false;
      if( answers ) {
        var quizRows = [];
        quizData.quizId = quizId;
        var friendlyName = typeformConfig.quizConfigs[quizId].friendlyName;
        for( var questionKey in answers ) {
          var answer = quizData.answerStrings[questionKey];
          if( validator.isURL( answer ) ) {
            quizRows.push( <tr key={Math.round(Math.random()*1000)}><td>{quizData.questionStrings[questionKey]}</td><td><img className="img-responsive" src={answer}></img></td></tr> );
          } else {
            quizRows.push( <tr key={Math.round(Math.random()*1000)}><td>{quizData.questionStrings[questionKey]}</td><td>{quizData.answerStrings[questionKey]}</td></tr> );
          }

        }
        if( quizRows.length ) {
          rows.push(
            <div className="panel panel-default" id={friendlyName} key={Math.round(Math.random()*1000)}>
              <div className="panel-heading">{friendlyName}</div>
              <table className="table">
                <thead><tr>
                  <th>Question</th>
                  <th>Answer</th>
                </tr></thead>
                <tbody>
                  {quizRows}
                </tbody>
              </table>
            </div>
          );
        }
      }
    }
    for( var quizId in this.state.questionAndAnswersMap ) {
      processQuizData( quizId, this.state.questionAndAnswersMap[quizId] );
    }
    return (
      <div className="userinfo">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h1 className="headerLine">User Information</h1>
            </div>
          </div>
          <div className="row">
            <hr />
          </div>
            {rows}
        </div>
      </div>
    );
  },
  _onChange: function() {
    this.setState({questionAndAnswersMap: TypeformStore.getQuestionAnswerPairs()});
  }
});

module.exports = WunderlistDashboardTypeformView;
