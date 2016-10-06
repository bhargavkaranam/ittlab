"use strict";

/*
I don't fully understand the nodejs way, or how it's supposed to work.
As such, adhering to the everchanging JS standards is a pain.
So, all the ugly stuff is in this file, and this file "just works"
Everything else is abstracted away in the game modules, which are
written in their own consistent standard.
*/

//Nodejs stuff
let game = require("./DotBots-server.js");
let express = require('express');
let app = express();
let http = require('http').Server(app);
let WebSocketServer = require('ws').Server;
let wss = new WebSocketServer({ server: http });


let players = 0;

function ws_disconnecthandler()
{
	players--;
	console.log("WS ", this.upgradeReq.connection.remoteAddress," disconnected, ", players, " clients connected")
}

//For every new websocket connection:
function ws_connecthandler(ws)
{
	players++;
	console.log("WS ", ws.upgradeReq.connection.remoteAddress," connected, ", players, " clients connected")
	game.connectPlayer(ws)
	ws.on('close', ws_disconnecthandler);
}
wss.on('connection', ws_connecthandler);

app.get('/DotBots', function(req, res){
  res.sendFile('Public/index.html', {root : "."});
});
app.use(express.static('Public')); //Makes all contents of Public folder public

http.listen(3000, (function(){game.main()})())