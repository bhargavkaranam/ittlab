"use strict";

//Current time
// var mapEdgeLength = 4000;
// var Player = require("./Public/Player")
// var PlayerTable = new Map();
// var ServerNetworkManager
// {
// 	ServerNetworkManager = function()
// 	{

// 	}
// 	let proto = ServerNetworkManager.prototype
// 	proto.update  = function(id, dq, dl, dir, dt)
// 	{
// 		if (!PlayerTable.has(id))
// 		{
// 			PlayerTable.set(id, new Player(id, Math.random()*mapEdgeLength, Math.random()*mapEdgeLength,
// 			 dir, dt))
// 		}
// 	}
// }

{
	let curTime = Date.now();

	//Visible class
	let Visible
	{
		Visible =  function()
		{
			this.players = new Map() //Ordered list of Players with coords relative to player
			this.drops = new Map()
		}
	}
}