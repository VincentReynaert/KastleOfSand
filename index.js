//gestion de la DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/KastleofSand');
var ObjectId = require('mongoose').Types.ObjectId; 

/*****************************************************************************************************
    Objets
******************************************************************************************************/


function listeNumero_objet() {      

  	this.return_all = function() { 
  		var deferred = Q.defer();
  		listeNumero.find()
  		.exec(function(err,fiches){
  			if (err==true){
  				deferred.reject(err);
  			}
  			else{
  				deferred.resolve(fiches);
  			}
  		}); 
  		return deferred.promise;
  	};
  	this.return_one = function(id) { 
  		var deferred = Q.defer();
  		listeNumero.findById(id)
		.exec(function(err,fiches){
			if (err==true){
				deferred.reject(err);
			}
			else{
				deferred.resolve(fiches);
			}
		});
  		return deferred.promise;
  	};
  	this.numero_is_unique = function(nouveauNumero) { 
  		var deferred = Q.defer();
  		listeNumero.find({numero:nouveauNumero.numero}).count()
		.exec(function(err,fiches){
			if (err==true){
				deferred.reject("erreur lors de la vérification de l unicité du titre, problème base de données. Vueillez ré-essayer s il vous plait");
			}
			else{
				if (fiches == 0){
					deferred.resolve(fiches);
				}
				else {
					deferred.reject("Titre déjà existant, choisissez un titre unique.");
				}
			}
		});
  		return deferred.promise;
  	};
  	this.new_numero = function(nouveauNumero) { 
  		var deferred = Q.defer();
  		nouveauNumero.save(function(err){
  			if (err){
  				deferred.reject('erreur lors de l enregistrement du produit dans la base de donnée. Vueillez ré-essayer s il vous plait');
  			}
  			else{
  				deferred.resolve('');
  			}
  		});
  		return deferred.promise;
  	};
  	this.supr = function (titre_entre) {
  		var deferred = Q.defer();
  		Produit.remove({ titre: titre_entre })
		.exec(function(err,fiches){
			if (err){
				deferred.reject('err_querry_base_donnee');
			}
			else{
				deferred.resolve('');
			}
	  	})
	  	return deferred.promise;
	};
	this.return_one_libre = function() { 
  		var deferred = Q.defer();
  		listeNumero.findOne({'avancement': "libre"})
		.exec(function(err,fiches){
			if (err==true){
				deferred.reject(err);
			}
			else{
				deferred.resolve(fiches);
			}
		});
  		return deferred.promise;
  	};
  	this.rendez_vous = function(numero_id) { 
  		console.log(numero_id);
  		var deferred = Q.defer();
  		listeNumero.update({'_id': numero_id},  {
			$set: { "avancement": "rendez-vous" }
		}) 
		.exec(function(err){ 
			if (err){ 
				deferred.reject(err);
			} 
			else{ 
				deferred.resolve('');
			} 
		}) 
  		return deferred.promise;
  	};
  	this.avancement_liberer = function(numero_id) { 
  		console.log(numero_id);
  		var deferred = Q.defer();
  		listeNumero.update({'_id': numero_id},  {
			$set: { "avancement": "libre" }
		}) 
		.exec(function(err){ 
			if (err){ 
				deferred.reject(err);
			} 
			else{ 
				deferred.resolve('');
			} 
		}) 
  		return deferred.promise;
  	};
}
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

/*****************************************************************************************************
    gestion des POSTS
******************************************************************************************************/

app.post('/api/retourne_projet', function(req,res) {
	var list_Projet = new Projet_objet;
	
	list_Projet.retourne(req.body)
	.then(function(data){
		res.json(data);
	}, function(error) {     
		res.json('err');
	});
});


/*****************************************************************************************************
	Update
******************************************************************************************************/



/*****************************************************************************************************
    Fin en faite
******************************************************************************************************/



io.on('connection', function (socket) {

  	socket.on('active_phase_client', function (message, fn) {
  		var list_Projet = new Projet_objet;
        list_Projet.active_phase(message._id)
		.then(function(data){
			socket.broadcast.emit('active_phase_server', message);
			fn({etat: true, data});
		}, function(error) {     
			fn({etat: false, error});
		});
    });	

  	socket.on('disconnect', function () {

  	});
});