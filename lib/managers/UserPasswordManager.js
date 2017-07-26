var DataManager = require('./DataManager')
    , LogManager = require('./LogManager')
    , TableConsts = require('../constants/TableConsts.js')
    , bcrypt = require('bcrypt')
    , crypto = require('crypto')
    , notp = require('notp')
    , encryptionAlgorithm = 'aes-256-ctr'
    , encryptionPassword = 'SoSimple'
    , sendgrid = require('sendgrid')(env.current.sendgrid.api_key)
    , EmailConstants = require('../constants/email/EmailConstants.js')
    ;

var THREE_HOURS = 10800;
var CRYPT_PADDING = 'PAD'; //for longer urls
function createHash( password, callback ) {
    bcrypt.genSalt(10, function( err, salt ) {
      bcrypt.hash( password, salt, function( err, hash ) { //bcrypt
          callback( err, hash );
      });
    });
}

function validateHash( storedHash, password, callback ) {
    bcrypt.compare( password, storedHash, function( err, isCorrect ) {
      if( err ) {
        console.log(err);
      }
      callback( err, isCorrect );
    });
}
function sendTotpEmail( email, pass, templateId, callback ) {
    email = email.toLowerCase();
    var sgEmail = new sendgrid.Email();
    sgEmail.addTo(email);
    var subject = "";
    sgEmail.subject = subject;
    sgEmail.from = "hello@swellist.com";
    sgEmail.fromname = "Swellist";
    sgEmail.html = " "; // we're using a template, and this isn't allowed to be blank.
    sgEmail.text = " "; // we're using a template, and this isn't allowed to be blank.
    var substitutions = {
            "%token%": [pass],
            "%email%": [email],
            "%subject%": [subject]
         };
    for (var tag in substitutions) {
        sgEmail.addSubstitution(tag, substitutions[tag]);
    }
    sgEmail.setCategories(["forgot_password"])
    sgEmail.setASMGroupID(69);
    sgEmail.setFilters({
        'templates': {
          'settings': {
            'enable': 1,
            'template_id': templateId
          }
        }
      });
    sendgrid.send(sgEmail, (err, sendResponse)=>{
      if( err ) {
        console.log("Problem sending email. $(sgEmail)", err);
        callback(err);
      } else {
        callback(null, sendResponse);
      }
    });
}

module.exports.addUserPassword = function( email, password, callback ) {
    email = email.toLowerCase();
    createHash( password, function( err, hash ) {
        DataManager.putValueForKeyInTableNoCache( hash, email, TableConsts.UserPass, function( err, storeResult ) {
            if( callback ) {
                callback( err, storeResult );
            }
        });
    });
}

module.exports.addAdminPassword = function( email, password, callback ) {
    email = email.toLowerCase();
    createHash( password, function( err, hash ) {
        DataManager.putValueForKeyInTableNoCache( hash, email, TableConsts.AdminPass, function( err, storeResult ) {
            callback( err, storeResult );
        });
    });
}

module.exports.checkUserTotp = function( email, totpPass, callback ) {
    email = email.toLowerCase();
    DataManager.getItemWithKeyInTableFromCache( email, TableConsts.TotpTokens, function( err, token ) {
        if( err ) {
            callback( err, null );
            return;
        }

        var totpResult = notp.totp.verify( totpPass, token, {} );
        if( totpResult ) {
            if( totpResult.delta ) { //&& Math.abs( totpResult.delta ) < 120 ) {
                callback( null, true );
            }
        } else {
            callback( null, false );
        }
    });
}

module.exports.resetUserPassword = function( email, baseUrl, callback ) {
    email = email.toLowerCase();
    crypto.randomBytes( 48, function( ex, buf ) {
        var token = buf.toString( 'hex' );

        DataManager.putValueForKeyInCache( token, email, TableConsts.TotpTokens, THREE_HOURS, function( err, storeData ) {
            if( err ) {
                callback( err, null );
                return;
            }

            var totpPass = notp.totp.gen( token, {} );
            console.log(totpPass);

            sendTotpEmail( email, totpPass, EmailConstants.FORGOT_PASSWORD_TEMPLATE_ID, function( err, data ) {
                if( err ) {
                    callback( err, null );
                    return;
                }

                callback( null, data );
            }); 
        });
    });
}

module.exports.resetAdminUserPassword = function( email, baseUrl, callback ) {
    email = email.toLowerCase();
    crypto.randomBytes( 48, function( ex, buf ) {
        var token = buf.toString( 'hex' );

        DataManager.putValueForKeyInCache( token, email, TableConsts.TotpTokens, THREE_HOURS, function( err, storeData ) {
            if( err ) {
                callback( err, null );
                return;
            }

            var totpPass = notp.totp.gen( token, {} );
            console.log(totpPass);

            var sgEmail = new sendgrid.Email();
            sgEmail.addTo(email);
            var subject = "Reset Your Swellist Password";
            sgEmail.subject = subject;
            sgEmail.from = "hello@swellist.com";
            sgEmail.fromname = "Swellist";
            sgEmail.html = "<a href='" + baseUrl + "/resetpassword?email=" + email + "&token=" + totpPass + "'>Link to reset password</a>";
            sgEmail.setCategories(["forgot_password"]);
            sendgrid.send(sgEmail, (err, sendResponse)=>{
              if( err ) {
                console.log("Problem sending email. $(sgEmail)", err);
                callback(err, null);
              } else {
                callback(null, sendResponse);
              }
            });
        });
    });
}

module.exports.checkUserRole = function( email, callback ) {
    DataManager.getItemWithKeyInTableNoCache( email, TableConsts.AdminWhitelist, function( err, role ) {
        if( err ) {
            return callback( err, null );
        }
        if( !role ) {
            console.log( 'no role found for : ' + email );
            callback( null, null );
            return;
        }
        callback( null, role );
    });
}

module.exports.getFriendlyRole = function( role ) {
    switch( role ) {
        case "admin": return "Administrator";
        case "taskmaster": return "Content Manager";
        case "creator": return "Content Creator";
        case "supervisor": return "Supervisor";
    }
};

function userHasPasswordForEmail( email, callback ) {
    email = email.toLowerCase();
    DataManager.getItemWithKeyInTableNoCache( email, TableConsts.UserPass, function( err, storedHash ) {
        if( err ) {
            return callback( err );
        }
        if( storedHash ) {
            return callback( null, true );
        } else {
            return callback( null, false );
        }
    });
}
module.exports.userHasPasswordForEmail = userHasPasswordForEmail;

function checkPassword( email, password, table, callback ) {
    email = email.toLowerCase();
    DataManager.getItemWithKeyInTableNoCache( email, table, function( err, storedHash ) {
        if( err ) {
            callback( err, null );
            return;
        }

        if( !storedHash ) {
            callback( null, null );
            return;
        }

        validateHash( storedHash, password, function( err, isCorrect ) {
            callback( err, isCorrect );
        });
    });
}
module.exports.checkPassword = checkPassword;

module.exports.checkAdminPassword = function( email, password, callback ) {
    checkPassword( email, password, TableConsts.AdminPass, callback );
};

module.exports.checkUserPassword = function( email, password, callback ) {
    checkPassword( email, password, TableConsts.UserPass, callback );
};

module.exports.encrypt = function (text) {
    text = CRYPT_PADDING + text;
    var cipher = crypto.createCipher(encryptionAlgorithm, encryptionPassword);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
};

module.exports.decrypt = function (text){
    var decipher = crypto.createDecipher(encryptionAlgorithm, encryptionPassword);
    try {
        var dec = decipher.update(text,'hex','utf8');
    } catch( e ) {
        LogManager.log("Problem decrypting: " + text + "\n" + e + "\n" + e.stack, LogManager.LOG_LEVEL_ROLLBAR);
        return "";
    }
    dec += decipher.final('utf8');
    return dec.replace(CRYPT_PADDING, "");
};
