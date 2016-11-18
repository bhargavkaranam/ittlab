"use strict";

const assert = function(val, mess)
{
	if (!val)
		(null).assertionFailed = 0
}

let play = {main : ()=>null };//require("server-play")
const dbglog = console.log;

/*
Modes/Lifecycle of a player:
Registering (Give your name, synch timestamps)
=> Preparing (Spawn location decided, etc, preparations made by server)
=> Playing (Player is playing right now)
=> Dead (Player has died, and camera is lingering)
=> Preparing
*/

{
	const nameCheck = /^[a-z_0-9]{1,10}$/i
	const PlayerTable = new Map(); //WebSocket => Player Details
	const NamePool = new Set();
	
	//PlayerTable is sent to other modules as context, and is thus const.

	const PlayerFSM = function* ()
	{
		const [player, ws, FSM] = yield; //Bind to these variables, given on connection
		const FSMcall = FSM.next.bind(FSM, FSM);
		{	//Get name
			let name = yield
			while (NamePool.has(name) || !nameCheck.test(name)) //Input name
			{
	 			ws.send(1) //Name invalid
	 			name = yield	
	 		}

	 		NamePool.add(name)
	 		console.log(NamePool)
	 		player.name = name;
	 		ws.send(0)
	 	}
	 	{	//Synch timestamps
	 		let min = 9999;
	 		const id = new Buffer([0])
	 		const pongHandler = (data) => { if(data[0]===id[0]) FSMcall() }
	 		ws.on("pong", pongHandler)
	 		
	 		for(let i=0; i<10; i++)
	 		{
	 			let lag = Date.now()
	 			id[0] = Math.floor(Math.random()*256);
	 			ws.ping(id)
		 		//We need to have a mechanism so yield's source is trusted.
		 		//This mechanism is making FSMcall created yields return the FSM
		 		assert(FSM === (yield)); //Wait for pong to callback
		 		lag = Date.now() - lag;
	 			dbglog("Detected lag of: ", lag); //DEBUG:
	 			if(lag < min)
	 				min = lag;
	 		}
	 		ws.removeListener("pong", pongHandler)
	 		dbglog("Minimum latency: ", min)
		 	//min is the time it takes to send a message to the client
		 }
		}



		let messageHandler = function(message)
		{
			let details = PlayerTable.get(this)
			details.onMessage.next(message)
		}
		let connectPlayer = function(ws)
		{
			let FSM = PlayerFSM();
			let details = {onMessage : FSM};
			PlayerTable.set(ws, details)
			FSM.next();
			FSM.next([details, ws, FSM])
			ws.on("message", messageHandler)
		//ws.on("close", disconnectHandler)
	}
	let main = function()
	{
		play.main({PlayerTable : PlayerTable});
		exports.connectPlayer = connectPlayer; //Start accepting connections
	}
	exports.main = main;
}