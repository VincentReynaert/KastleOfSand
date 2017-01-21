//gestion de la DB
/*var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/KastleofSand');
var ObjectId = require('mongoose').Types.ObjectId; */

/*****************************************************************************************************
    Objets
******************************************************************************************************/

/*****************************************************************************************************
    gestion du serveur HTTP
******************************************************************************************************/


var express = require('express');
var bodyParser = require('body-parser');
//var session = require('express-session');
//var Q = require('q');


var app = express();

var server = app.listen(4000);
var io = require('socket.io').listen(server);

app.use('/JavaScript', express.static(__dirname + '/views/javascript'))
app.use('/lib', express.static(__dirname + '/views/lib'))
app.use('/image', express.static(__dirname + '/views/image'))
app.use('/css', express.static(__dirname + '/views/css'))
app.use('/template', express.static(__dirname + '/views/template'))


app.use(bodyParser.json())


/*****************************************************************************************************
    gestion des sessions
******************************************************************************************************/
//app.use(session({ secret: 'keyboard cat'}))

/*****************************************************************************************************
    gestion des gets
******************************************************************************************************/


app.get('/', function (req, res) {
	res.sendfile(__dirname + '/views/ex11.html');
});

var partie = function(){
  var new_round;
  idRound= 1;
  var main = function(channel){
    new_round= setTimeout(()=>{
      waves(channel);
    }, 10000)
  }

  var waves = function(channel){
    idRound++;
    io.sockets.in(channel).emit("incoming_wave", {roundId: idRound});
    console.log("incoming_wave"+idRound, channel);
    main(channel);
  }

  
}


io.sockets.on('connection', function (socket) {

	socket.on('register', function(message){
		socket.channel= message.channel;
		socket.join(message.channel);
    io.sockets.in(socket.channel).emit("init", {board: [[0,0,0],[0,0,0],[0,0,0]], roundId: idRound});
    console.log("connecter"+ message.channel);
    main(socket.channel);
	});

  socket.on('finished', function(message) {
    console.log(message);
    if(message && typeof message.roundId === 'number' && message.roundId === idRound){
  		clearTimeout(new_round);
  		waves(socket.channel);
  	}
  });

	socket.on('disconnect', function () {
    console.log("user disconnect");
    clearTimeout(new_round);
	});
});




