var mongoose = require('mongoose');

// User Schema
var PostSchema = mongoose.Schema({
	title: String,
	artist: String,
	description: String,
	ref: String // url link, id or filename
});

module.exports = mongoose.model('StudioPost', PostSchema);
