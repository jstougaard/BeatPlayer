var events = require('events').EventEmitter,
	heartbeats = require('heartbeats');

var beatCount = 0;

var defaultOptions = {
	bpm: 120,
	noteResolution: 16,
	pattern: []
};

var getHeartBeatTime = function(bpm, resolution) {
	return Math.round(60*1000 / bpm / (resolution/4) );
};

// Constructor
function BeatKeeper(options) {
	if (!(this instanceof BeatKeeper)) return new BeatKeeper(options);
	this.setOptions(options);
	
	this._heart = null;
	this._beatCount = 0;
}

// Extend EventEmitter
BeatKeeper.prototype = Object.create(events.prototype);


BeatKeeper.prototype.setOptions = function(options){
	if (!this.options)
		this.options = defaultOptions;

	for (var key in options){
		this.options[key] = options[key];
	}

	return this;
};


// Event callback - only works if bind(this)
function onBeat() {

	// Is note active according to pattern
	var isActive = !!this.options.pattern[this._beatCount];

	// Emit event
	this.emit('beat', isActive);

	// Increment count
	this._beatCount++;
	if (this._beatCount >= this.options.noteResolution) 
		this._beatCount = 0;
}

BeatKeeper.prototype.start = function() {

	// Create heart for keeping time
	this._heart = heartbeats.createHeart( this._getHeartBeatIntervalTime() );

	// Listen to heartbeats - listen to every pulse
	this._heart.createEvent(1, onBeat.bind(this));

};

BeatKeeper.prototype.isStarted = function() {
	return this._heart !== null;
};


BeatKeeper.prototype.stop = function() {
	if (!this.isStarted()) return;

	this._heart.killAllEvents();
	this._heart.kill();
	this._heart = null;
};


BeatKeeper.prototype.setBPM = function(bpm) {
	this.options.bpm = bpm;
	if (this.isStarted())
		this._heart.setHeartrate( this._getHeartBeatIntervalTime() );
};

BeatKeeper.prototype.setRhythmPattern = function(pattern) {
	this.options.pattern = pattern;
};


BeatKeeper.prototype._getHeartBeatIntervalTime = function() {
	return Math.round(60*1000 / this.options.bpm / (this.options.noteResolution/4) );
};

module.exports = BeatKeeper;