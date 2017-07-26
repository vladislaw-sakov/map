var TypeformManager = require('../lib/managers/TypeformManager.js')
    , typeformConfig = require( '../lib/managers/typeform/typeform-config.json' )
    , configQuizIds = [];
    ;

for(var quizId in typeformConfig.quizConfigs) {
  configQuizIds.push(quizId);
}

module.exports = function( app, express ) {
    app.get('/typeform/update/:quizId', function( req, res ) {
        var quizId = req.params.quizId;
        TypeformManager.updateQuizById( quizId, function( err, data ) {
            res.send(200);
        });
    });

    app.get( '/user/:uid/typeformresponses', function( req, res ) {
        var uid = req.params.uid;
        var quizIds = req.query.quizIds ? req.query.quizIds : configQuizIds;
        var result = {};
        TypeformManager.getTypeformResponsesForUid( uid, quizIds, function( err, result ) {
            res.send(result);
        });
    });

    app.get( '/user/:uid/typeform/:quizId', function( req, res ) {
        var uid = req.params.uid;
        var quizId = req.params.quizId;

        TypeformManager.getTypeformResponseForUidAndQuizId( uid, quizId, function( err, data ) {
            res.success(data);
        });

    });

    app.get('/user/:uid/typeform')
};
