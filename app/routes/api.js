var bodyParser = require('body-parser');
var User       = require('../models/user');
var Post       = require('../models/post');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

	var apiRouter = express.Router();

	// route to authenticate a user w/ POST
	// apiRouter.post('/authenticate', function(req, res) {

	// 	// find the user
	// 	// select the name email and password explicitly
	// 	User.findOne({
	// 		email: req.body.email
	// 	}).select('name.first name.last email password').exec(function(err, user) {

	// 		if (err)
	// 			throw err;

	// 		// no user with that email was found
	// 		if (!user) {
	// 			res.json({
	// 				success: false,
	// 				message: 'Authentication failed. User not found.'
	// 			});
	// 		}
	// 		else if (user) {

	// 			// check if password matches
	// 			var validPassword = user.comparePassword(req.body.password);

	// 			if(!validPassword) {
	// 				res.json({
	// 					success: false,
	// 					message: 'Authentication failed. Wrong password.'
	// 				});
	// 			}
	// 			else {

	// 				// if user is found and password is right
	// 				// create a token
	// 				var token = jwt.sign({
	// 					name: user.name.first + user.name.last,
	// 					email: user.email
	// 				}, superSecret, {
	// 					expiresIn: '24h'	// expires in 24 hours
	// 				});

	// 				// return the information including token as JSON
	// 				res.json({
	// 					success: true,
	// 					message: 'Enjoy your token!',
	// 					token: token
	// 				});
	// 			}

	// 		}

	// 	});
	// });

	// test route to make sure everything is working 
	// accessed at GET http://localhost:8080/api
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'hooray! welcome to our api!' });	
	});

	// on routes that end in /user
	// ----------------------------------------
	apiRouter.route('/users')
		
		// create a user (accessed at POST
		.post(function(req, res) {

			// create a new instance of the User model
			var user = new User();

			// set the user's info (comes from the request)
			user.name = req.body.name;
			user.username = req.body.username;
			user.email = req.body.email;
			user.password = req.body.password;

			// save the user and check for errors
			user.save( function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000)
						return res.json({ success: false, message: 'A user with\
							email already exists. '});
					else
						return res.send(err);
				}

				// res.json({ success: true, message: 'New user created!' });
				res.redirect("/user/" + user.username );
			});
		});

	apiRouter.route('/newPost')

		.post(function(req, res){
			var post = new Post();
			post.groupid = req.body.groupid;
			post.author = req.body.author;
			post.date = "0/0/0";
			post.postText = req.body.postText;
			post.pinned = req.body.pinned;

			post.save();

			res.send(post);
		});

	apiRouter.route('/user/:username/:group')

		.get(function(req, res){
			var group = req.params.group;
			var postList = Post.find({groupid: group});
			console.log(postList);
		});

	// api endpoint to get user information
	apiRouter.get('/me', function(req, res) {
		res.send(req.decoded);
	});

	return apiRouter;
};
