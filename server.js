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
var data = require('./mock-data/groups.json');

http.globalAgent.maxSockets = 20;

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

fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./mock-data/groups.json', 'utf8').toString());

app.get('/user/:username/', function(req, res){
	var username = req.params.username;
	if(obj === undefined) return;
	res.redirect("/user/" + username + "/" + obj.groups[0].TeamURL);
});

app.get('/user/:username/account-settings', function(req, res){
	var username = req.params.username;
	res.render('settings', {'UserName': username, "groups": obj.groups});
});


app.get('/user/:username/:group', function(req, res){
	var username = req.params.username;
	var group = (req.params.group).toLowerCase();
	var groupData;

	if(obj === undefined){
		fs = require('fs');
		obj = JSON.parse(fs.readFileSync('./mock-data/groups.json', 'utf8').toString());
	}
	groupData = obj.groups[findGroup(group)];
	res.render('index', {"groupData": groupData, "UserName": username, "groups": obj.groups});

});
/*
app.get('/user/:username/:group/b', function(req, res){
	var username = req.params.username;
	var group = (req.params.group).toLowerCase();
	var groupData;
	var currentElement;

	data['isOriginal'] = false;

	if(obj === undefined){
		fs = require('fs');
		obj = JSON.parse(fs.readFileSync('./mock-data/groups.json', 'utf8').toString());
	}
	groupData = obj.groups[findGroup(group)];
	res.render('index', {"groupData": groupData, "UserName": username, "groups": obj.groups, "isOriginal": data["isOriginal"]});
});*/

app.get("/joinGroup/:groupName", function(req, res){
	var group = req.params.groupName;
	console.log(__dirname);
	res.render('addGroup', {'groupName': group});
});

app.post("/addGroup", function(req, res){
	var group = req.body;
	if(findGroup(group) == -1){
		obj.groups.push(group);
	}
	res.send(group.TeamURL);
});

app.get("/user/:userName/:groupName/addMember", function(req, res){
	if(obj === undefined) return;
	var grouploc = findGroup(req.params.groupName);
	var group = obj.groups[grouploc];
	var user = req.params.userName;
	for (var i = 0; i <= group.members.length - 1; i++) {
		if(group.members[i] === user){
			console.log("already member");
			return;
		}
	}
	console.log("adding member");
	obj.groups[grouploc].members.push(user);
	console.log(obj.groups[grouploc].members);
});

app.post("/user/:userName/:groupName/newPost", function(req, res){
	var postData = req.body;
	var group = req.params.groupName;
	console.log("adding post to " + group);
	var groupIndex = findGroup(group);
	if (obj.groups[groupIndex].posts === undefined){
		console.log("Initializing array");
		obj.groups[groupIndex].posts = [];
	}
	console.log("posting||| " + obj.groups[groupIndex].posts.length);
	obj.groups[groupIndex].posts.unshift(postData);
	console.log("responding||| "+obj.groups[groupIndex].posts.length);
	res.send(200);
});


app.get("/user/:userName/:groupName/remove/:timeStamp", function(req,res){
	console.log("DELETING");
	var groupName = req.params.groupName;
	var timeStamp = req.params.timeStamp;
	var groupIndex = findGroup(groupName);
	var groupData = obj.groups[groupIndex];
	for (var i = 0; i <= groupData.posts.length - 1; i++) {
		currentElement = groupData.posts[i];
		if(currentElement.timeStamp == timeStamp){
			console.log("found the post");
			obj.groups[groupIndex].posts.splice(i, 1);
			return;
		}
	}
});

app.get('/getStarted', function(req, res){
	res.render('sign_up');
});


app.get('/:groupName/:lastUpdate', function(req, res){
	console.log("aaaaa");
	var groupName = req.params.groupName;
	var lastUpdate = req.params.lastUpdate;
	console.log(lastUpdate);
	var newPosts = [];
	if(obj === undefined){ 
		return;
	}
	var groupData = obj.groups[findGroup(groupName)];
	if(groupData === undefined) { 
		return;
	}
	if(groupData.posts === undefined) { 
		return;
	}
	console.log("checking for posts....");
	console.log("num of posts: " + groupData.posts.length);
	for (var i = 0; i <= groupData.posts.length - 1; i++) {
		currentElement = groupData.posts[i];
		console.log(currentElement.timeStamp > lastUpdate);
		if(Number(currentElement.timeStamp) > Number(lastUpdate)){
			console.log(lastUpdate + " is less than " + currentElement.timeStamp);
			newPosts.push(currentElement);
		}
		else{
			break;
		}
	}
	console.log("new posts: " + newPosts.length);
	res.send(newPosts);
});

function findGroup(groupName){
	//console.log("finding location of " + groupName);
	if(obj === undefined) return;
	var currentElement;
	for (var i = obj.groups.length - 1; i >= 0; i--) {
		currentElement = obj.groups[i];
		if(currentElement.TeamURL ==  groupName){
			return i;
		}
	}
	return -1;
	//console.log("found: " + i);
}


// START THE SERVER
// ====================================
app.listen(config.port);
console.log('Magic happens on port ' + config.port);