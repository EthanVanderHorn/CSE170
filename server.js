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
var handlebars = require('express-handlebars');


// Example route
// var user = require('./routes/user');


// APP CONFIGURATION ==================
// ====================================

app.set('views', path.join(__dirname, 'public/app/views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');


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

app.get('/user/:username/', function(req, res){
	var username = req.params.username;
	var obj;
	fs = require('fs')
	fs.readFile('./mock-data/groups.json', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		obj = JSON.parse(data);
		res.redirect("/user/" + username + "/" + obj.groups[0].TeamURL);
	});
	//location.href = "/user/" + username + "/cogs120";
});

app.get('/user/:username/:group', function(req, res){
	var username = req.params.username;
	var group = (req.params.group).toLowerCase();
	var obj;
	var groupData;
	fs = require('fs')
	fs.readFile('./mock-data/groups.json', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		obj = JSON.parse(data);
		for (var i = obj.groups.length - 1; i >= 0; i--) {
			currentElement = obj.groups[i];
			if(currentElement.TeamURL ==  group){
				groupData = currentElement;
				break;
			}
		};
		res.render('index', {"groupData": groupData, "UserName": username, "groups": obj.groups});
	});
});

app.get('/user/:username/account-settings', function(req, res){
	var username = req.params.username;
	res.render('settings', {'UserName': username});
});

// START THE SERVER
// ====================================
app.listen(config.port);
console.log('Magic happens on port ' + config.port);