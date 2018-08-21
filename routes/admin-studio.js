var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var upload = require('../config/upload');
var clearMedia = require('../config/config').clearMedia;
var studiopost = require('../models/studiopost');

let conn = mongoose.connection;

let gfs;
conn.once('open', function() {
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('studio_media');
});
// ===================================================

route.post('/post/submit', (req, res) => {
	studiopost.find((err, posts) => {
		if (!posts || !posts.length) {
			var newPost = new studiopost({
				title: req.body.title,
				artist: req.body.artist,
				description: req.body.description
			});
			newPost.save(err => {
				if (err) throw err;
			});
		} else {
			posts[0].title = req.body.title;
			posts[0].artist = req.body.artist;
			posts[0].description = req.body.description;
			posts[0].save(err => {
				if (err) return err;
			});
		}
		res.send('done')
	})
});

route.post('/upload/media', (req, res) => {
	var image = upload.single('song');
	// new upload process
	image(req, res, err => {
		if (err) {
			console.log(err);
			return res.redirect(req.get('referer'));
		}
		gfs.files.find().sort({uploadDate: -1}).toArray((err, songs) => {
			var song = songs[0].filename;
			var songToDelete = songs[1].filename;
			studiopost.find((err, posts) => {
				posts[0].ref.push(song);
				posts[0].save(err => {
					if (err) return err;
					gfs.remove({filename: songToDelete}, (err, gridStore) => {
						res.redirect(req.get('referer'));
					})
				});
			});
		});
	});
});

module.exports = router;
