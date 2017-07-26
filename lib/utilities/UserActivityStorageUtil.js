var StringUtils = require('./StringUtilities.js')
    , _ = require('underscore')
    ;


function getSQLInsertStatementForActivityMeta(activityObj) {
    var queryString = 'INSERT INTO activity_objects_meta (' +
        'id'+
        ', uid' +
        ', type' +
        ', updatedAt' +
        (activityObj.actorId ? ', actorId': '') + '' +
        (activityObj.deletedAt ? ', deletedAt': '') + '' +
        (activityObj.hasOwnProperty('priority') ? ', priority': '') + '' +
        (activityObj.hasOwnProperty('rating') ? ', rating': '') + '' +
        (activityObj.attributedToType ? ', attributedToType': '') + '' +
        (activityObj.attributedToId ? ', attributedToId': '') + '' +
        (activityObj.unlockAt ? ', unlockAt ': '') +

        ') VALUES(' +

        activityObj.id+
        ', \''+ StringUtils.addSlashes(activityObj.uid)+'\''+
        ', \''+ StringUtils.addSlashes(activityObj.type)+'\''+
        ', FROM_UNIXTIME('+Math.round(_.now()/1000)+')'+
        (activityObj.actorId ? ', \''+StringUtils.addSlashes(activityObj.actorId)+'\'' : '') + '' +
        (activityObj.deletedAt ? ', FROM_UNIXTIME('+activityObj.deletedAt+')' : '') + '' +
        (activityObj.hasOwnProperty('priority') ? ', '+activityObj.priority : '') + ''+
        (activityObj.hasOwnProperty('rating') ? ', '+activityObj.rating : '') + ''+
        (activityObj.attributedToType ? ', '+activityObj.attributedToType : '') + '' +
        (activityObj.attributedToId ? ', '+activityObj.attributedToId : '') + '' +
        (activityObj.unlockAt ? ', FROM_UNIXTIME('+activityObj.unlockAt+')' : '') +
        ')' +

        ' ON DUPLICATE KEY UPDATE ' +

        'id=VALUES(id)'+
        ', uid=VALUES(uid) '+
        ', type=VALUES(type)'+
        ', updatedAt=VALUES(updatedAt) '+
        (activityObj.actorId ? ', actorId=VALUES(actorId)' : '') + '' +
        (activityObj.deletedAt ? ', deletedAt=VALUES(deletedAt)' : '') + '' +
        (activityObj.hasOwnProperty('priority') ? ', rating=VALUES(priority)' : '') + ''+
        (activityObj.hasOwnProperty('rating') ? ', rating=VALUES(rating)' : '') + ''+
        (activityObj.attributedToType ? ', attributedToType=VALUES(attributedToType)' : '') + '' +
        (activityObj.attributedToId ? ', attributedToId=VALUES(attributedToId)' : '') + '' +
        (activityObj.unlockAt ? ', unlockAt=VALUES(unlockAt)' : '') + '' +
        ';';

    return queryString;
}
module.exports.getSQLInsertStatementForActivityMeta = getSQLInsertStatementForActivityMeta;

function getSQLInsertStatementForRaw(activityObj) {
    var queryString = 'INSERT INTO activity_objects_data (' +
        'id, uid, object' +

        ') VALUES(' +

        activityObj.id +', '+
        activityObj.uid + ', '+
        '\''+StringUtils.addSlashes(JSON.stringify(activityObj.object))+'\''+
        ')'+

        ' ON DUPLICATE KEY UPDATE ' +

        'id=VALUES(id), uid=VALUES(uid), object=VALUES(object);';

    return queryString;
}
module.exports.getSQLInsertStatementForRaw = getSQLInsertStatementForRaw;