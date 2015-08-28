//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081)
    , BeatKeeper = require('./BeatKeeper');

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');

  var beatkeeper = new BeatKeeper();
  
  socket.on('start_beat', function(bpm) {
    if (beatkeeper.isStarted()) return;
    
    console.log("Starting Beat", bpm);
    beatkeeper.setOptions({
      bpm: parseInt(bpm,10)
    }).start();

  });

  socket.on('stop_beat', function(value) {
    if (!beatkeeper.isStarted()) return;
    
    console.log("Stopping Beat", value);
    beatkeeper.stop();
    
  });

  socket.on('new_bpm', function(value) {
    console.log("New BPM", value);
    beatkeeper.setBPM(parseInt(value,10));
  });

  socket.on('update_rhythm', function(pattern) {
    console.log("Update rhytm", JSON.stringify(pattern));
    beatkeeper.setRhythmPattern(pattern);
  });

  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
    beatkeeper.removeAllListeners();
  });

  // Broadcast on beat
  beatkeeper.addListener('beat', function(isActive) {
    //socket.broadcast.emit('beat',isActive);
    socket.emit('beat',{isActive: isActive});
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Your Page Title'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX' 
            }
  });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );

/////// MANAGE BEAT /////////
//console.log("Starting beat");
//beatkeeper.start(60);
/**setTimeout(function() {
  beatkeeper.setBPM(120);
}, 6000);*/
