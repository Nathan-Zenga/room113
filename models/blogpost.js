var mongoose = require('mongoose');

var PostSchema = mongoose.Schema({
	title: String,
	subtitle: String,
	textbody: String,
	tags: Array,
	mediaList: Array
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

module.exports = mongoose.model('BlogPost', PostSchema);
