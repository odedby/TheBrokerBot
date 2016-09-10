var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var stocks = require('./routes/stocks.js');

var privateKey = fs.readFileSync('/etc/letsencrypt/live/oded.by/privkey.pem');
var certificate = fs.readFileSync('/etc/letsencrypt/live/oded.by/cert.pem');
var chain = fs.readFileSync('/etc/letsencrypt/live/oded.by/chain.pem');
var credentials = {key: privateKey, cert: certificate, ca: chain};

var httpsApp = express();
httpsApp.use(bodyParser.urlencoded({extended : false }));
httpsApp.use(bodyParser.json());
httpsApp.use(bodyParser.json({type : 'application/vnd.api+json'}));
httpsApp.get('/', function(req, res) {
	res.send('Hello from papo (secured!)');
});

var httpsServer = https.createServer(credentials, httpsApp);
httpsApp.use('/stocks', stocks);
httpsServer.listen(443, function() {
	console.log('Example https app listening on port 443');
});

var httpApp = express();
httpApp.get('/', function(req, res) {
	res.send('Hello from papo');
});
httpApp.use(express.static('./images'));

var httpServer = http.createServer(httpApp);
httpServer.listen(80, function() {
	console.log('Example app listening on port 80');
});
