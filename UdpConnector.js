var dgram = require('dgram');
var socket;

function initSocket() {
	socket = dgram.createSocket('udp4');
}


/**
 * UdpConnector class for sending messages to pure data
 */
function UdpConnector(port, host) {
	this.port = port;
	this.host = host || '127.0.0.1';
}

UdpConnector.prototype.send = function(messageString){
	if (!socket) initSocket();

	var message = new Buffer(messageString+";\r\n");
	var port = this.port;
	var host = this.host;

	socket.send(message, 0, message.length, port, host, function(err, bytes) {
		if (err) throw err;
		console.log('UDP message sent to ' + host +':'+ port);
		//client.close(); // Do not close yet
	});
};

UdpConnector.prototype.close = function(){
	socket.close();
	socket = null;
};

module.exports = UdpConnector;