"use strict";

let env = require('../../env.js')
, AWS = require('aws-sdk')
, TableConsts = require('../constants/TableConsts.js')
, async = require('async')
;

AWS.config.update({apiVersion:"2012-08-10"});
AWS.config.update({sslEnabled:false});
AWS.config.update({region:env.current.aws.region});
if( env.current.aws.endpoint ) {
  AWS.config.update({endpoint:env.current.aws.endpoint});
}

var dynamodb = new AWS.DynamoDB();

const TABLE_NAME = "UserPreferences";

var params = {
  TableName : TABLE_NAME,
  KeySchema: [
    { AttributeName: "uid", KeyType: "HASH"},  //Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: "uid", AttributeType: "S" }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};

dynamodb.createTable(params, function(err, data) {
  if (err) {
    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    dynamodb.listTables((err, data)=>{
      console.log(err, data);
    });
  }
});

// dynamodb.deleteTable({"TableName": TABLE_NAME}, (err, data)=>{
//   console.log(err, data);
// });
