function arrayListFromString( rawString ) {
    var list = rawString.split( ',' );
    var result = [];
    for( var i = 0; i<list.length; i++ ) {
        var element = list[i];
        element = element.trim();
        if( element ) { //
            result.push( element );
        }
    }
    return result;
}
module.exports.arrayListFromString = arrayListFromString;

function truncate(string, targetLength) {
    return string.length>targetLength ? string.substr(0,targetLength-1)+'...' : string;
}
module.exports.truncate = truncate;


function addHttp(url) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    if(!regexp.test(url)) {
        url = "http://" + url;
    }
    return url;
}
module.exports.addHttp = addHttp;

function addSlashes( theString ) {
    if( !theString ) {
        return '';
    }
    theString = theString.toString();
    return theString.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}
module.exports.addSlashes = addSlashes;

/**
 * use this to make a Base64 encoded string URL friendly,
 * i.e. '+' and '/' are replaced with '-' and '_' also any trailing '='
 * characters are removed
 *
 * @param {String} str the encoded string
 * @returns {String} the URL friendly encoded String
 */
function Base64EncodeUrl(str){
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}
module.exports.Base64EncodeUrl = Base64EncodeUrl;

/**
 * Use this to recreate a Base64 encoded string that was made URL friendly
 * using Base64EncodeurlFriendly.
 * '-' and '_' are replaced with '+' and '/' and also it is padded with '+'
 *
 * @param {String} str the encoded string
 * @returns {String} the URL friendly encoded String
 */
function Base64DecodeUrl(str){
    str = (str + '===').slice(0, str.length + (str.length % 4));
    return str.replace(/-/g, '+').replace(/_/g, '/');
}
module.exports.Base64DecodeUrl = Base64DecodeUrl;

function isImageFileName( fname ) {
    var extension = fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);
    extension = extension.split("?")[0];
    extension = extension.toLowerCase();
    switch( extension ) {
        case "tif":
        case "tiff":
        case "jpg":
        case "jpeg":
        case "gif":
        case "png":
        case "bmp":
        case "bmpf":
            return true;
            break;
        default:
            return false;
    }
}
module.exports.isImageFileName = isImageFileName;
