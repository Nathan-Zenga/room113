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
			posts[0].song = req.body.songUrl;
			posts[0].artwork = req.body.artworkUrl;
			posts[0].save(err => {
				if (err) return err;
			});
		} else {
			var newPost = new studiopost({
				title: req.body.title,
				artist: req.body.artist,
				description: req.body.description,
				song: req.body.songUrl,
				artwork: req.body.artworkUrl
			});
			newPost.save(err => { if (err) throw err });
		}
		res.send('/studio')
	})
});

router.post('/media/upload', (req, res) => {
	var up = upload.fields([{name: 'song'}, {name: 'artwork'}]);
	// new upload process
	up(req, res, err => {
		if (err) {
			console.log(err);
			return res.redirect(req.get('referer'));
		}
		studiopost.find((err, posts) => {
			var song = req.files.song ? req.files.song[0].filename : posts[0].song;
			var artwork = req.files.artwork ? req.files.artwork[0].filename : posts[0].artwork;
			gfs.collection('studio_audio');
			gfs.remove({filename: {$ne: song}, root: 'studio_audio'}, err => {
				gfs.collection('studio_artwork');
				gfs.remove({filename: {$ne: artwork}, root: 'studio_artwork'}, err => {
					if (err) return err;
					posts[0].song = song;
					posts[0].artwork = artwork;
					posts[0].save(err => { if (err) return err; res.redirect('/studio') });
				});
			});
		});
	});
});

module.exports = router;
