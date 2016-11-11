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

var hbs = handlebars.create({
	helpers : {
		ifCond :  function (v1, operator, v2, options) {
			switch (operator) {
				case '==':
				return (v1 == v2) ? options.fn(this) : options.inverse(this);
				case '===':
				return (v1 === v2) ? options.fn(this) : options.inverse(this);
				case '!=':
				return (v1 != v2) ? options.fn(this) : options.inverse(this);
				case '!==':
				return (v1 !== v2) ? options.fn(this) : options.inverse(this);
				case '<':
				return (v1 < v2) ? options.fn(this) : options.inverse(this);
				case '<=':
				return (v1 <= v2) ? options.fn(this) : options.inverse(this);
				case '>':
				return (v1 > v2) ? options.fn(this) : options.inverse(this);
				case '>=':
				return (v1 >= v2) ? options.fn(this) : options.inverse(this);
				case '&&':
				return (v1 && v2) ? options.fn(this) : options.inverse(this);
				case '||':
				return (v1 || v2) ? options.fn(this) : options.inverse(this);
				default:
				return options.inverse(this);
			}
		}
	}
});
// Example route
// var user = require('./routes/user');


// APP CONFIGURATION ==================
// ====================================

app.set('views', path.join(__dirname, 'public/app/views'));
app.engine('handlebars', hbs.engine);
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
mongoose.connect(config.database); 

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));


// ROUTES FOR THE API ---------------
// ===================================

var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);


// MAIN CATCHALL ROUTE --------------- 
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/splash.html'));
});

var obj;

app.get('/user/:username/', function(req, res){
	var username = req.params.username;
	if(obj == undefined){
		fs = require('fs');
		obj = JSON.parse(fs.readFileSync('./mock-data/groups.json', 'utf8').toString());
	}
	res.redirect("/user/" + username + "/" + obj.groups[0].TeamURL);
});

app.get('/user/:username/account-settings', function(req, res){
	var username = req.params.username;
	console.log("settings");
	res.render('settings', {'UserName': username});
});

app.get('/user/:username/:group', function(req, res){
	var username = req.params.username;
	var group = (req.params.group).toLowerCase();
	var groupData;
	if(obj == undefined){
		fs = require('fs');
		obj = JSON.parse(fs.readFileSync('./mock-data/groups.json', 'utf8').toString());
	}
	for (var i = obj.groups.length - 1; i >= 0; i--) {
		currentElement = obj.groups[i];
		if(currentElement.TeamURL ==  group){
			groupData = currentElement;
			break;
		}
	};
	res.render('index', {"groupData": groupData, "UserName": username, "groups": obj.groups});
});

app.post("/changeJson", function(req, res){
	obj.groups.push(req.body);
});

app.post("/newPost", function(req, res){
	var groupName = req.body.group;
	var postData = req.body.post;
	var groupData;
	var username = postData.author;

	for (var i = obj.groups.length - 1; i >= 0; i--) {
		currentElement = obj.groups[i];
		if(currentElement.TeamName ==  groupName){
			groupData = currentElement;
			if(postData.pinned == "no")
				currentElement.Pinned.unshift(postData);
			else
				currentElement.Posts.unshift(postData);
			break;
		}
	};

	//res.render('index', {"groupData": groupData, "UserName": username, "groups": obj.groups});


});

app.get('/getStarted', function(req, res){
	res.render('sign_up');
});



// START THE SERVER
// ====================================
app.listen(config.port);
console.log('Magic happens on port ' + config.port);