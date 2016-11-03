// BASE SETUP
// ======================================

// CALL THE PACKAGES --------------------
var express    = require('express');		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser'); 	// get body-parser
var morgan     = require('morgan'); 		// used to see requests
var mongoose   = require('mongoose');
var config 	   = require('./config');
var path 	   = require('path');
var http	   = require('http');
var handlebars = require('express-handlebars')

// Example route
// var user = require('./routes/user');

var app = express();

// APP CONFIGURATION ==================
// ====================================

app.set('views', path.join(__dirname, 'public/app/views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded());
//app.use(express.methodOverride());
//app.use(express.cookieParser('Intro HCI secret key'));
//app.use(express.session());


// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// log all requests to the console 
app.use(morgan('dev'));

// connect to our database (hosted on modulus.io)
// mongoose.connect(config.database); 

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));



// MAIN CATCHALL ROUTE --------------- 
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/splash.html'));
});

app.get('/user/:username', function(req, res){
	var username = req.params.username;
	res.render('index', {
		'UserName': username, 
		'TeamName': 'Cogs 120', 
		'TeamDescription': 'dis the team description yo', 
		'Member1': 'Connie Guan', 
		'Member2': 'Jacqui Bontigao', 
		'Member3': 'Miguel Vargas', 
		'Member4': 'Ethan Vander Horn'});
});

// START THE SERVER
// ====================================
app.listen(config.port);
console.log('Magic happens on port ' + config.port);