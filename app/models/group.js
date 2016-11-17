// grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema
var GroupSchema	= new Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	members: [String],

	posts: [String],
});

module.exports = mongoose.model('Group', GroupSchema);