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

var allTableSetups = [
  (callback)=>{ // 0
    createGenericTable(TableConsts.AdminPass, callback);
  },
  (callback)=>{ // 1
    createGenericTable(TableConsts.AdminWhitelist, callback);
  },
  (callback)=>{ // 2
    createGenericTable(TableConsts.Facebook, callback);
  },
  createJobsGlobalCountTable, // 3
  createJobsTable, // 4
  (callback)=>{ // 5
    createGenericTable(TableConsts.InviteCodes, callback);
  },
  (callback)=>{ // 6
    createGenericTable(TableConsts.Notes, callback);
  },
  (callback)=>{ // 7
    createGenericTable(TableConsts.Session, callback);
  },
  (callback)=>{ // 8
    createUidHashedTable(TableConsts.TipCounts, callback);
  },
  createTipsTable, // 9
  (callback)=>{ // 10
    createGenericTable(TableConsts.TotpTokens, callback);
  },
  createTypeformResponsesTable, // 11
  (callback)=>{ // 12
    createGenericTable(TableConsts.User, callback);
  },
  (callback)=>{ // 13
    createGenericTable(TableConsts.UserCount, callback);
  },
  (callback)=>{ // 14
    createGenericTable(TableConsts.UserEmail, callback);
  },
  (callback)=>{ // 15
    createGenericTable(TableConsts.UserId, callback);
  },
  (callback)=>{ // 16
    createGenericTable(TableConsts.UserPass, callback);
  },
  (callback)=>{ // 17
    createGenericTable(TableConsts.UserLocations, callback);
  },
  (callback)=>{ // 18
    createUidHashedTable(TableConsts.UserPreferences, callback);
  },
  (callback)=>{ // 19
    createGenericTable(TableConsts.UserProfile, callback);
  },
  (callback)=>{ // 20
    createUidHashedTable(TableConsts.UserTimestamps, callback);
  },
  (callback)=>{ // 21
    createGenericTable(TableConsts.UserWunderlist, callback);
  },
  createWaitingListTable, // 22
  (callback)=>{ // 23
    createUidHashedTable(TableConsts.AdminUserNotes, callback);
  },
  (callback)=>{ // 24
    createGenericTable(TableConsts.UserPhone, callback);
  },
  (callback)=>{ // 25
    createGenericTable(TableConsts.UserStripe, callback);
  },
  createUserTokensTable // 26
];

var doSetupAll = process.env.DO_SETUP_ALL;
if(doSetupAll) {
  runSetups(allTableSetups);
} else {
  var upgradeStart = process.env.UPGRADE_START;
  var upgradeEnd = process.env.UPGRADE_END;
  if(typeof upgradeStart !== 'undefined') {
    var upgradeStartVersion = parseInt(upgradeStart)
    var upgradeEndVersion = parseInt(upgradeEnd);
    var tableUpgrades = [];
    if(typeof upgradeEnd !== 'undefined') {
      tableUpgrades = allTableSetups.slice(upgradeStartVersion, upgradeEndVersion);
    } else {
      tableUpgrades = allTableSetups.slice(upgradeStartVersion);
    }
    runSetups(tableUpgrades);
  }
}

function runSetups(aTableSetups) {
  async.parallel(aTableSetups, (error)=>{
    if(error) {
      return console.log(`Error creating tables: ${JSON.stringify(error)}`);
    }
    dynamodb.listTables((err, data)=>{
      console.log(err, data);
      addSeedData((error)=>{
        if(error) {
          console.log(`${JSON.stringify(error)}`);
        }
        console.log("Seed data completed.");
      });
    });
  });
}

function putItemInTable(item, tableName, callback) {
  dynamodb.putItem({
              TableName: tableName,
              Item: item,
              ReturnValues: "ALL_OLD"
            }, function( err, data ) {
              if( err ) {
                console.log( err );
                return callback( err );
              }
              callback();
            });
}

function addSeedData(callback) {
  async.parallel([
    (callback)=>{
      putItemInTable({
        "key": {
          "S": "rabaya@gmail.com"
        },
        "value" : {
          "S": "admin"
        }
      }, TableConsts.AdminWhitelist, callback);
    },
    (callback)=>{
      putItemInTable({
        "key": {
          "S": "team@simplelabsinc.com"
        },
        "value" : {
          "S": "admin"
        }
      }, TableConsts.AdminWhitelist, callback);
    },
    (callback)=>{
      putItemInTable({
        "key": {
            "S": "global"
          },
          "value" : {
            "N": "0"
          }
        }, TableConsts.UserCount, callback);
    },
    (callback)=>{
      putItemInTable({
        "key": {
          "S": "cap"
        },
        "value" : {
          "N": "1000000"
        }
      }, TableConsts.UserCount, callback);
    },
    (callback)=>{
      putItemInTable({
        "key": {
          "S": "invite_code_seed"
        },
        "value" : {
          "N": "137425"
        }
      }, TableConsts.UserCount, callback);
    }
  ], (error)=>{
    callback();
  })
}

function createTableWithParams(params, callback) {
  dynamodb.createTable(params, function(error, data) {
    if (error) {
      console.error("Unable to create table. Error JSON:", JSON.stringify(error, null, 2));
      callback(error);
    } else {
      console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
      callback();
    }
  });
}

function createGenericTable(tableName, callback) {
  console.log("createGenericTable: " + tableName);
  var params = {
    TableName: tableName,
    AttributeDefinitions : [
      {
        AttributeName : "key",
        AttributeType : "S"
      }
    ],
    KeySchema: [{
      AttributeName: "key",
      KeyType: "HASH"
    }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };
  createTableWithParams(params, callback);
}

function createUidHashedTable(tableName, callback) {
  var params = {
    TableName : tableName,
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
  createTableWithParams(params, callback);
}

function createTypeformResponsesTable(callback) {
  var params = {
    TableName: TableConsts.TypeformResponses,
    AttributeDefinitions : [
      {
        AttributeName : "quizId",
        AttributeType : "S"
      },
      {
        AttributeName : "uid",
        AttributeType : "S"
      },
      {
        AttributeName: "dateSubmit",
        AttributeType: "N"
      }
    ],
    KeySchema: [
      {
        AttributeName: "quizId",
        KeyType: "HASH"
      },
      {
        AttributeName: "uid",
        KeyType: "RANGE"
      }
    ],
    "LocalSecondaryIndexes": [
      {
        "IndexName": "DateSubmitIndex",
        "KeySchema": [
          {
            "AttributeName": "quizId",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "dateSubmit",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 2,
      WriteCapacityUnits: 2
    }
  }
  createTableWithParams(params, callback);
}

function createUserTokensTable(callback) {
  var params = {
    TableName : TableConsts.UserTokens,
    KeySchema: [
      { AttributeName: "uid", KeyType: "HASH" },  //Partition key
      { AttributeName: "service", KeyType: "RANGE" }  //Sort key
    ],
    LocalSecondaryIndexes: [{
      IndexName: 'CreationDate-index',
      KeySchema: [
        {
          AttributeName: 'uid',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'service',
          KeyType: 'RANGE'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      }
    }],
    AttributeDefinitions: [
      { AttributeName: "uid", AttributeType: "S" },
      { AttributeName: "service", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };
  createTableWithParams(params, callback)
}

function createTipsTable(callback) {
  var params = {
    TableName : TableConsts.Tips,
    KeySchema: [
      { AttributeName: "uid", KeyType: "HASH" },  //Partition key
      { AttributeName: "id", KeyType: "RANGE" }  //Sort key
    ],
    LocalSecondaryIndexes: [{
      IndexName: 'CreationDate-index',
      KeySchema: [
        {
          AttributeName: 'uid',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'createdAt',
          KeyType: 'RANGE'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      }
    }],
    AttributeDefinitions: [
      { AttributeName: "uid", AttributeType: "S" },
      { AttributeName: "id", AttributeType: "N" },
      { AttributeName: "createdAt", AttributeType: "N" }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };
  createTableWithParams(params, callback)
}

function createJobsTable(callback) {
  // indexed jobs
  var params = {
    TableName: "Jobs",
    AttributeDefinitions : [
      {
        AttributeName : "key",
        AttributeType : "N"
      },
      {
        AttributeName: "run_at",
        AttributeType: "N"
      },
      {
        AttributeName: "status",
        AttributeType: "N"
      },
      {
        AttributeName: "failure_count",
        AttributeType: "N"
      },
      {
        AttributeName: "service",
        AttributeType: "S"
      },
      {
        AttributeName: "last_update",
        AttributeType: "N"
      }
    ],
    KeySchema: [
      {
        AttributeName: "key",
        KeyType: "HASH"
      },
      {
        AttributeName: "run_at",
        KeyType: "RANGE"
      }
    ],
    "LocalSecondaryIndexes": [
      {
        "IndexName": "StatusIndex",
        "KeySchema": [
          {
            "AttributeName": "key",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "status",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      },
      {
        "IndexName": "FailureCountIndex",
        "KeySchema": [
          {
            "AttributeName": "key",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "failure_count",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      },
      {
        "IndexName": "ServiceIndex",
        "KeySchema": [
          {
            "AttributeName": "key",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "service",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      },
      {
        "IndexName": "LastUpdateIndex",
        "KeySchema": [
          {
            "AttributeName": "key",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "last_update",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };
  createTableWithParams(params, callback);
}

function createJobsGlobalCountTable(callback) {
  var params = {
    AttributeDefinitions : [
      {
        AttributeName : "key",
        AttributeType : "S"
      }
    ],
    TableName: "JobCount",
    KeySchema: [{
      AttributeName: "key",
      KeyType: "HASH"
    }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };
  createTableWithParams(params, callback);
}

function createWaitingListTable(callback) {
  var params = {
    TableName: "WaitingList",
    AttributeDefinitions : [
      {
        AttributeName : "type",
        AttributeType : "S"
      },
      {
        AttributeName : "key",
        AttributeType : "S"
      },
      {
        AttributeName: "metadata",
        AttributeType: "S"
      },
      {
        AttributeName: "priority",
        AttributeType: "N"
      },
      {
        AttributeName: "deleted",
        AttributeType: "N"
      }
    ],
    KeySchema: [
      {
        AttributeName: "type",
        KeyType: "HASH"
      },
      {
        AttributeName: "key",
        KeyType: "RANGE"
      }
    ],
    "LocalSecondaryIndexes": [
      {
        "IndexName": "PriorityIndex",
        "KeySchema": [
          {
            "AttributeName": "type",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "priority",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      },
      {
        "IndexName": "DeletedIndex",
        "KeySchema": [
          {
            "AttributeName": "type",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "deleted",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      },
      {
        "IndexName": "MetadataIndex",
        "KeySchema": [
          {
            "AttributeName": "type",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "metadata",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  }
  createTableWithParams(params, callback);
}
