/* Author: Jeppe Stougaard
*/
var isPlaying = false;
var noteLength = 0.10;      // length of "beep" (in seconds)
var canvas,                 // the canvas element
    canvasContext;          // canvasContext is the canvas' context 2D
var beatMarkers = [];
var stateChanged = true;
var audioContext;
var socket;
var currentNote = -1,
	lastNote = -1;

// First, let's shim the requestAnimationFrame API, with a setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();


function resetCanvas (e) {
    // resize the canvas - but remember - this clears the canvas too.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //make sure we scroll to the top left.
    window.scrollTo(0,0); 
}

function draw() {

    // We only need to draw if the note has moved.
    if (currentNote != lastNote || stateChanged) {
        canvasContext.clearRect(0,0,canvas.width, canvas.height); 

        beatMarkers.forEach(function(box, i) {
            // Draw selector box
            canvasContext.fillStyle = box.active ? "blue" : "#ccc";
            canvasContext.fillRect( box.left, box.top, box.width, box.height );

            // Draw indicator box
            if (currentNote == i && isPlaying) {
                canvasContext.fillStyle = '#999';
                canvasContext.fillRect( box.left, box.top - box.height/3 - 5, box.width, box.height/3 );
            }
            
        });

        stateChanged = false;
    }

    // set up to draw again
    requestAnimFrame(draw);
}

function initBeatMarkers() {
    beatMarkers = []; // TODO: Consider keeping state

    var x = Math.floor( canvas.width / 18 );
    for (var i=0; i<16; i++) {
        beatMarkers.push({
            left: x * (i+1) + x/4,
            top: x,
            width: x/2,
            height: x/2,
            active: 0
        });
    }
}

function sendUpdatedRhythm() {
	var rhythm = [];
	beatMarkers.forEach(function(marker) {
		rhythm.push(marker.active?1:0);
	});
	console.log("Update rhythm", rhythm);
	socket.emit('update_rhythm', rhythm); 
}

function init(){
    var container = document.createElement( 'div' );

    container.className = "container";
    canvas = document.createElement( 'canvas' );
    canvasContext = canvas.getContext( '2d' );
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    document.body.appendChild( container );
    container.appendChild(canvas);    
    canvasContext.strokeStyle = "#ffffff";
    canvasContext.lineWidth = 2;

    initBeatMarkers();

    canvas.addEventListener('click', function(e) {
        //console.log("Canvas clicked", e);
        var x = event.offsetX,
            y = event.offsetY;

        // Determine clicked element
        beatMarkers.forEach(function(box, i) {
            if (y > box.top && y < box.top + box.height && x > box.left && x < box.left + box.width) {
                box.active = !box.active;
                stateChanged = true;         
            }
        });


        if (stateChanged) {
        	// Do send new state
        	sendUpdatedRhythm();
        }

    }, false);

    audioContext = new AudioContext();

    // if we wanted to load audio files, etc., this is where we should do it.

    window.onorientationchange = resetCanvas;
    window.onresize = resetCanvas;

    requestAnimFrame(draw);    // start the drawing loop.
}






$(document).ready(function() {   

	socket = io.connect();
	init();

	$('#toggleBeat').on('click', function() {
		console.log("toggleBeat", isPlaying);
		if (!isPlaying) {
			$(this).text('Stop');
			socket.emit('start_beat', $("#tempo").val()); 
		} else {
			$(this).text('Start');
			socket.emit('stop_beat', true); 
		}

		isPlaying = !isPlaying;
	});


	$("#tempo").on('input', function() {
		$(this).next().html($(this).val());
	});

	$("#tempo").on('change', function() {
		if (!isPlaying) return;

		var bpm = $(this).val();
		console.log("Send new BPM to server", bpm);
		socket.emit('new_bpm', bpm);  
	});


	socket.on('beat', function(data){
		console.log("Beat!", currentNote, data);

		lastNote = currentNote;
		currentNote++;
		if (currentNote >= beatMarkers.length) currentNote = 0; 

		if (data.isActive) {
			var oscillator = audioContext.createOscillator();
			oscillator.frequency.value = 440.0;

			oscillator.connect(audioContext.destination);

			oscillator.start();
			oscillator.stop(audioContext.currentTime + 0.05);
		}
	});

});