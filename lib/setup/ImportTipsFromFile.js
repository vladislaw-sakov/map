"use strict";

var env = require('../../env');

var AWS = require('aws-sdk')
, fs = require('fs')
;

AWS.config.update({apiVersion:"2012-08-10"});
AWS.config.update({sslEnabled:false});
AWS.config.update({region:env.current.aws.region});
if( env.current.aws.endpoint ) {
    AWS.config.update({endpoint:env.current.aws.endpoint});
}

var docClient = new AWS.DynamoDB.DocumentClient();
console.log(`${process.env.TIPS_FILE}`);

// tips_1010432.json
var tipsString = fs.readFileSync(process.env.TIPS_FILE);
var tips = JSON.parse(tipsString);
for(let tip of tips) {
  var params = {
    Item: tip,
    TableName: "Tips"
  };

  docClient.put(params, (error, data)=>{
    if(error) {
      var message = "Error saving tip: " + JSON.stringify(params);
      return console.log(`${error}`);
    } else {
      return console.log(`Finished: ${tip.name}`);
    }
  });
}
