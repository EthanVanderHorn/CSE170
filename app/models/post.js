// grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema
var PostSchema	= new Schema({
	author: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required: true
	}
	text: {
		type: String,
		required: true
	},
	pinned: {
		type String,
		required: true
	}
});

module.exports = mongoose.model('Post', PostSchema);