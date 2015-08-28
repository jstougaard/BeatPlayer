var dgram = require('dgram');
var socket;

function initScoket() {
	socket = dgram.createSocket('udp4');
}


/**
 * PDConnector class for sending messages to pure data
 */
function PDConnector(port, host) {
	this.port = port;
	this.host = host;
}

PDConnector.prototype.send = function(messageString){
	if (!socket) initSocket();

	var message = new Buffer(messageString);

	socket.send(message, 0, message.length, this.port, this.host, function(err, bytes) {
		if (err) throw err;
		console.log('UDP message sent to ' + this.host +':'+ this.port);
		//client.close(); // Do not close yet
	});
};

PDConnector.prototype.close = function(){
	socket.close();
	socket = null;
};

module.exports = PDConnector;