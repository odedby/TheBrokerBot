var AWS = require('aws-sdk');
var Q = require('q');

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var dynamoDB = {
 setUser: function (user) {
   console.log('setUser');
   var dynamodb = new AWS.DynamoDB();
   var docClient = new AWS.DynamoDB.DocumentClient();
   var params = {
    TableName: "users",
    Item: user
};

docClient.put(params, function(err, data) {
   if (err) {
       console.error("Unable to add user", user.userId, ". Error JSON:", JSON.stringify(err, null, 2));
   } else {
       console.log("PutItem succeeded:", user.userId);
   }
});
 },
 getUser: function(userId) {
   console.log('getUser');
   var deferred = Q.defer();
   var docClient = new AWS.DynamoDB.DocumentClient();
   var table = "users";
   var params = {
     TableName: table,
     Key:{
       "userId": userId
     }
   };
   docClient.get(params, function(err, data) {
     if (err) {
       console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
       deferred.reject(error);
     } else {
       console.log("GetItem succeeded:"/*, JSON.stringify(data, null, 2)*/);
       deferred.resolve(data);
     }
   });
   return deferred.promise;
 },
 updateUser: function (user) {
   console.log('updateUser');

   var dynamodb = new AWS.DynamoDB();
   var docClient = new AWS.DynamoDB.DocumentClient();
   var params = {
    TableName: "users",
    Item: user
  };

  docClient.put(params, function(err, data) {
     if (err) {
         console.error("Unable to add user", user.userId, ". Error JSON:", JSON.stringify(err, null, 2));
     } else {
         console.log("PutItem succeeded:", user.userId);
     }
  });
 },
}

module.exports = dynamoDB;
