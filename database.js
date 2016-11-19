"use strict"
let express = require('express')
let mysql = require('mysql');
let router = express.Router();


let database = {
	connect : function() {
		let connection = mysql.createConnection({
			host : 'localhost',
			user : 'root',
			password : '',
			database : 'dotbots'
		});
		connection.connect()
		return connection
	},

	// playerJoin : function(id,ip,name) {
	// 	let insert = {id : id,name : name,ip : ip,timestamp : Date.now(),score : 0,banned : 0};
	// 	let connection = database.connect();
	// 	connection.query("INSERT INTO players SET ?",insert,function(err,result) {
	// 		if(!err)
	// 			return true
	// 		else
	// 			return false
	// 	});
	// 	connection.end();
	// },

	playerQuit : function(id) {
		let connection = database.connect();
		connection.query("DELETE FROM players WHERE id = " + connection.escape(id),function(err,result){
			if(!err)
				return true;
			else
				return false
		});
		connection.end();
	},

	getPlayerScore : function(id) {
		let connection = database.connect();
		let sql = "SELECT score FROM players WHERE id = " + connection.escape(id);
		connection.query(sql,function(err,rows,fields){
			return rows[0].score;
		});
		connection.end();
	},
	updateScore : function(name,score) {

		let connection = database.connect();
		
		
		let cscore
		let sql = "SELECT score FROM players WHERE name = " + connection.escape(name)
		connection.query(sql,function(err,rows,fields){
			if(!err)
			{
				if(rows.length)
				{
					let cscore = rows[0].score

					if(parseInt(score) > cscore)
					{
						
						let sql = "UPDATE players SET score = " + score + " WHERE name = " + connection.escape(name)
						connection.query(sql,function(err,results){
							
							if(err)
								return true;
							else
								console.log(err);
						});
					}
				}
				else
				{
					let insert = {name : name,score : score}
					connection.query("INSERT INTO players SET ?",insert,function(err,results){
						if(!err)
							return true;
						else
							console.log(err);
					});
				}
			}
			else
				console.log(err);
		});								
		// connection.end();
	},
	getGlobalHighScores : function() {
		let connection = database.connect();
		let sql = "SELECT score FROM players ORDER BY DESC LIMIT 10"
		connection.query(sql,function(err,rows,fields){
			return rows
		});
		connection.end();
	},

	addChatLog : function(name,ip,message) {
		let connection = database.connect();

		let insert = {name : name,ip : ip,message : message,timestamp : Date.now()};
		connection.query("INSERT INTO chats SET ?",insert,function(err,result){
			if(!err)			
				return true;
			else
				console.log(err);
		});
		// connection.end();
	},

	banIp : function(ip) {
		let connection = database.connect();
		let sql = "UPDATE ips SET banned = 1 WHERE ip = " + ip;
		connection.query(sql,function(err,results){
			if(!err)
				return true;
		});
		connection.end();
	},

	isIpBanned : function(ip) {
		let connection = database.connect();
		let sql = "SELECT banned FROM ips WHERE ip = " + ip;
		connection.query(sql,function(err,rows,fields){
			if(!err)
			{
				if(rows[0].banned)
					return true;
				else
					return false;
			}
		});
		connection.end();	
	}



};

module.exports = database;