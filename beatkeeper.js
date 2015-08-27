var heartbeats = require('heartbeats');

var heart = null;
var currentBPM = 120;
var rhythmPattern = [];
var beatListeners = {};
var noteResolution = 16;

var beatCount = 0;

var isStarted = function() {
	return heart !== null;
};

var getHeartBeatTime = function() {
	return Math.round(60*1000 / currentBPM / (noteResolution/4) );
};

var onBeat = function(heartbeat) {
	//console.log('Beat!');

	var isActive = !!rhythmPattern[beatCount];

	for (var key in beatListeners) {
		beatListeners[key](isActive); // Parameter is if note is active
	}

	beatCount++;
	if (beatCount >= noteResolution) beatCount = 0;
};


module.exports.start = function(BPM) {
	if (BPM)
		currentBPM = BPM;

	// Create heart for keeping time
	heart = heartbeats.createHeart( getHeartBeatTime() );

	// Listen to heartbeats
	heart.createEvent(1, onBeat);

};

module.exports.stop = function() {
	if (!heart) return; // TODO: Throw exception
	heart.killAllEvents();
	heart.kill();
	heart = null;
};

module.exports.isStarted = isStarted;

module.exports.setBPM = function(BPM) {
	currentBPM = BPM;
	if (heart)
		heart.setHeartrate( getHeartBeatTime() );
};

module.exports.setRhythm = function(rhythm) {
	rhythmPattern = rhythm;
};

module.exports.addBeatListener = function(name, listener) {
	beatListeners[name] = listener;
};

module.exports.removeBeatListener = function(name) {
	delete beatListeners[name];
};