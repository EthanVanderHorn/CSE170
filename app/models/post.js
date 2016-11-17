// grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema
var PostSchema	= new Schema({
	groupid: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required: true
	},
	postText: {
		type: String,
		required: true
	},
	pinned: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Post', PostSchema);