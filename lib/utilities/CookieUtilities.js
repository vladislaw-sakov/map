/**
 * Created by robby on 2/19/16.
 */


module.exports.mixpanelCookieParser = function( cookies ) {
    var result;
    resultStr = cookies["mp_"+ env.current.mixpanel.token +"_mixpanel"] || "";
    if( resultStr ) {
        try {
            result = JSON.parse(resultStr);
        } catch( e ) {

        }
    }
    return result;
};