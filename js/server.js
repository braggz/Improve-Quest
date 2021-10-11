var express = require('express');
var path = require('path');
directHttp = express();
var mysql = require('mysql');
var express = require('express');

var fs = require('fs');
var programPath = path.join(__dirname, '../');
var htmlRoot = programPath + "/html";
let reqPath = path.join(__dirname, './sql.json');
var dir = path.join(__dirname, '../');
let rawdata = fs.readFileSync(reqPath);
directHttp.use(express.static(dir));
var createGame = require("./createGame.js");
var joinGame = require("./joinGame.js");
var checkStatus = require("./checkStatus.js");
var dir = path.join(__dirname, '../i');
let json = JSON.parse(rawdata);
var con= mysql.createPool({
  host: json.host,
  user: json.user,
  password: json.password,
  database: json.database
});
console.log(dir);
const http = require('http');
const WebSocketServer = require('websocket').server;

directHttp.listen(80);
directHttp.get('/', function (req, res) {
  res.sendFile(htmlRoot+'/index.html')
});
directHttp.get('/createGame', function (req, res) {
	console.log("here");
  res.sendFile(htmlRoot+'/createGame.html')
});
directHttp.get('/hostGame', function (req, res) {
	console.log("here");
  res.sendFile(htmlRoot+'/hostGame.html')
});
directHttp.get('/playGame', function (req, res) {
	console.log("here");
  res.sendFile(htmlRoot+'/playGame.html')
});
directHttp.get('/startGame', function (req, res) {
	console.log("here");
  res.sendFile(htmlRoot+'/startGame.html')
});

const server = http.createServer();
server.listen(9898);
const wsServer = new WebSocketServer({
    httpServer: server
});


wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
      //console.log(utf8Data,connection)
	  parseActions(message.utf8Data,connection);
    });
    connection.on('close', function(reasonCode, description) {
        console.log('Client has disconnected.');
    });
});


 function parseActions(data,connection){
	var parsedData = JSON.parse(data);
	if(parsedData.action == "createGame"){
		createGame.createGame(parsedData,connection).then((response) => {
			
			var data = {
				action:"gameCreated",
				value:response.id
			}
			connection.sendUTF(JSON.stringify(data));
			
		});
	}
	else if(parsedData.action == "checkStatus"){
		checkStatus.checkStatus(parsedData.gameId).then((response) =>{
			var data = {
				action:"checkStatus",
				data:response
			}
			
			connection.sendUTF(JSON.stringify(data));
		})
	}
	else if(parsedData.action == "joinGame"){
		console.log(parsedData);
		joinGame.joinGame(parsedData.gameId,connection).then((joinRes) => {
			console.log(joinRes);
			if(joinRes.action != "error"){
				var data = {
				action:"joinedGame",
				value:joinRes.playerId,
				players:joinRes.players
				}
				console.log(JSON.stringifydata);
				connection.sendUTF(JSON.stringify(data));
			}
			else{
				console.log("what the fuck");
				connection.sendUTF(JSON.stringify(joinRes));
			}
			
		});
	}
}






