/**
 * Created by robby on 12/7/15.
 */

var jsonRequest = require('request-json')
;


function getLocationObjectFromAddress( address, callback ) {
    var url = 'http://maps.googleapis.com/maps/api/geocode/json?address='+address;
    var client = jsonRequest.createClient(url);
    var result = {}
    client.get(url, function( err, response, body ) {
        if( err ) {
            return callback( err );
        }
        if( !body || !body.results || !(body.results.length > 0) ) {
            return callback( new Error("No results found for address") );
        }
        var firstResponse = body.results[0];

        var components = firstResponse.address_components ? firstResponse.address_components : [];

        for( var i = 0; i<components.length; i++ ) {
            var component = components[i];
            var types = component.types;
            for( var j = 0; j<types.length; j++ ) {
                var type = types[j];
                var translatedComponent = translateComponent( type, component );
                if( translatedComponent ) {
                    result = Object.assign( result, translatedComponent );
                    break;
                }
            }
        }

        if( firstResponse.formatted_address ) {
            result.formatted_address = firstResponse.formatted_address;
        }

        if( firstResponse.geometry && firstResponse.geometry.location ) {
            if( firstResponse.geometry.location.lat ) {
                result.latitude = firstResponse.geometry.location.lat;
            }

            if( firstResponse.geometry.location.lng ) {
                result.longitude = firstResponse.geometry.location.lng;
            }
        }
        callback( null, result );
    });
}

module.exports.getLocationObjectFromAddress = getLocationObjectFromAddress;

function translateComponent( type, component ) {
    var result;
    switch( type ) {
        case "country":
            result = { "country_code": component.long_name };
            break;
        case "postal_code":
            result = { "zipcode": component.long_name };
            break;
        case "administrative_area_level_1":
            result = { "region_code": component.long_name };
            break;
        case "locality":
            result = { "city": component.long_name };
            break;
    }
    return result;
}
