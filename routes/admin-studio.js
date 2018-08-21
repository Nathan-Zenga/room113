var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var upload = require('../config/upload');
var studiopost = require('../models/studiopost');

let conn = mongoose.connection;

let gfs;
conn.once('open', function() {
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('studio_media');
});
// ===================================================

router.get('/', (req, res) => {
	res.render('studio', {
		page: 'studio admin',
		admin: true
	});
});

router.post('/post/submit', (req, res) => {
	studiopost.find((err, posts) => {
		if (posts && posts.length) {
			posts[0].title = req.body.title;
			posts[0].artist = req.body.artist;
			posts[0].description = req.body.description;
			posts[0].song = req.body.url;
			posts[0].save(err => {
				if (err) return err;
			});
		} else {
			var newPost = new studiopost({
				title: req.body.title,
				artist: req.body.artist,
				description: req.body.description,
				song: req.body.url
			});
			newPost.save(err => {
				if (err) throw err;
			});
		}
		res.send('/studio')
	})
});

router.post('/upload/song', (req, res) => {
	var image = upload.single('song');
	// new upload process
	image(req, res, err => {
		if (err) {
			console.log(err);
			return res.redirect(req.get('referer'));
		}
		gfs.files.find().sort({uploadDate: -1}).toArray((err, songs) => {
			var file = songs[0].filename;
			var songToDelete = songs[1] ? songs[1].filename : undefined;
			studiopost.find((err, posts) => {
				posts[0].song = file;
				posts[0].save(err => {
					if (err) return err;
					if (songToDelete) {
						gfs.remove({filename: songToDelete, root: 'studio_media'}, (err, gridStore) => {
							if (err) return err;
							res.redirect('/studio');
						})
					}
				});
			});
		});
	});
});

module.exports = router;
