// Point to current environment/config values
var env = process.env.NODE_ENV || 'development';

exports.get = function(env) {
    var baseConfig = require(__dirname + '/config/'+env).config;
    if( process.env.CONFIG ) {
        var overrideConfig;
        try {
            overrideConfig = require(__dirname + '/config/' + process.env.CONFIG).config;
        } catch(e) {
            console.log(e);
        }
        if( overrideConfig ) {
            baseConfig = Object.assign({}, baseConfig, overrideConfig);
        }
    }
    return baseConfig;
};

exports.name = env;
exports.current = exports.get(env);
