var net = require('net');
var client = new net.Socket();


/**
 * TcpConnector class for sending messages to pure data
 */
function TcpConnector(port, host) {
	this.port = port;
	this.host = host || '127.0.0.1';
	this.isConnected = false;

	this.client = new net.Socket();
	this.connect();
}

TcpConnector.prototype.connect = function() {
	var _this = this;

	this.client.connect(this.port, this.host, function() {
		_this.isConnected = true;
	});
	this.client.on('close', function() {
		_this.isConnected = false;
	});
};

TcpConnector.prototype.send = function(message){
	if (!this.isConnected) {
		console.log("TcpConnector not connected");
		return;
	}

	//console.log("Write TCP message to "+this.host+":"+this.port+": "+message);
	this.client.write(message + ";\r\n");
};

TcpConnector.prototype.close = function(){
	this.client.end();
	this.isConnected = false;
};

module.exports = TcpConnector;