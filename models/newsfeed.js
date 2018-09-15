var mongoose = require('mongoose');

var PostSchema = mongoose.Schema({
	headline: String,
	text: String,
	image: String,
	tags: Array
}, {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	},
	date: {
		type: String,
		required: false
	}
});

module.exports = mongoose.model('Newsfeed', PostSchema);
