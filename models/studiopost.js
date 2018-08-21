var mongoose = require('mongoose');

var PostSchema = mongoose.Schema({
	title: String,
	artist: String,
	description: String,
	artwork: String,
	song: String
});

module.exports = mongoose.model('StudioPost', PostSchema);
