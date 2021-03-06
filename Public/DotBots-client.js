"use strict";

{
	var ws;

	const PlayerFSM = function* ()
	{
		const [player, ws, FSM] = yield;
		const FSMcall = FSM.next.bind(FSM, FSM);
		{	//Get name
			ws.send("FSM:getName")
			let name = prompt("Enter name: ")
			while ((yield) != 0) //Input name
		 	{
	 			name = prompt("Enter another name: ")
		 	}
		}
		{	//Synch timestamps
	 		let min = 9999; //a 10 second max lag is a very reasonable assumption.
	 		let minstart = 0
	 		let minnum = -1
	 		const id = new Buffer([0])
	 		const pongHandler = (data) => { if(data[0]===id[0]) FSMcall() }
	 		ws.on("pong", pongHandler)
		 		
	 		for(let i=0; i<10; i++)
	 		{
		 		id[0] = Math.floor(Math.random()*256)
		 		let start = Date.now()
		 		ws.ping(id)
		 		//We need to have a mechanism so yield's source is trusted.
		 		//This mechanism is making FSMcall created yields return the FSM
		 		//In the future we will have async/await to deal with this stuff
		 		//TODO: Change the generator mechanism to use asynch/await with nodejs7
		 		assert(FSM === (yield)); //Wait for pong to callback
		 		let lag = Date.now() - start;
	 			dbglog("Detected lag of: ", lag); //DEBUG:
	 			if(lag < min)
	 			{
	 				min = lag;
	 				minstart = start;
	 				minnum = i;
	 			}
		 	}
		 	ws.removeListener("pong", pongHandler)
		 	dbglog("Minimum latency: ", min)
		 	ws.send([i, minstart+min/2])	
		 	//min is the time it takes to send a message to the client
		}
	}

	//Visible class
	var Visible
	{
		Visible =  function()
		{
			this.players = new Map() //Ordered list of Players with coords relative to player
			this.drops = new Map()
		}
	}
	//Network managing class
	{
		function NetworkManager()
		{

		}
		let proto = NetworkManager.prototype
		
		//Agrees on a timestamp value
		proto.synchStamp = function()
		{
			socket.emit('ping', Date.now(), function(startTime) {
			    var latency = Date.now() - startTime;
			    console.log(latency);
			});
		}

		//Updates the Maps in visible, as per given data.
		proto.receiveUpdate  = function(data, visible)
		{
			//Receives all the nearby players and drops, with their coords relative to local player
			/*
			abs_dir is basically the player's input.
			Client acts upon input immidiately.
			Let REAL TIME be defined as the time when a client inputs on his local machine.
			Server runs the entire world C1 ms late, and detects collisions
			C1 is the maximum lag between server and client, nerfed to a realistic value.
			Client runs 2*C1 ms in the past.
			Client, while playing 2*C1 in the past, would be getting accurate world information at constant delay.
			"Not getting hunted" would be given priority over being hunted. Not being able to escape because of lag is worse than not being able to hunt because of lag.
			If a client DCs, then extrapolation using last known inputs is canonical, and client will be reset to canonical position when he reconnects.
			No jumping tolerated.

			http://buildnewgames.com/real-time-multiplayer/
			*/

		}
		//If there are two already in queue,
		//then one is removed before sending the next one.
		proto.sendUpdate = function(visible)
		{
			//Send dl,theta,dt,abs_dir for local player since last synch
			//Each of those 4 values is represented by a byte.
			//dl is mapped from 0 to dt*speed, theta is mapped from 0 to 2PI, dt is time since last synch, abs_dir is last known direction
			//This dl,dq should theoretically provide more resolution than dx,dy, since dxdy can contain invalid info
		}
	}
	var curTime = Date.now();
	function main()
	{
		// ws = new WebSocket("ws://122.178.217.77:3000/DotBots")
		// ws.onopen = function()
		// {
		// 	console.log("WS Connected")

		// }
		// ws.onerror = function()
		// {
		// 	document.body.innerHTML = "Sorry, could not establish WebSocket connection"	
		// }	
		

		let canvas = document.createElement("canvas")
		canvas.height = 400
		canvas.width = 600
		document.body.appendChild(canvas)
		let theme = new Theme(canvas)
		let visible = new Visible()
		visible.players.set(0, new Player(0, 200, 200, 3, curTime))
		visible.players.set(1, new Player(1, 60, 110, 4, curTime))
		visible.players.set(2, new Player(2, 110, 210, 4, curTime))
		function renderLoop()
		{
			curTime = Date.now();
			theme.simplerender(visible)
			window.requestAnimationFrame(renderLoop)
		}
		window.requestAnimationFrame(renderLoop)
	}
	window.onload = main
}