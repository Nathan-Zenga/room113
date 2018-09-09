var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var blog = require('../models/blogpost');
var studiopost = require('../models/studiopost');

let conn = mongoose.connection;

let gfs;
conn.once('open', function() {
	gfs = Grid(conn.db, mongoose.mongo);
});
// ===================================================

router.get('/', (req, res) => {
	res.render('index', { page: 'home' });
});

router.get('/cinema', (req, res) => {
	res.render('cinema', { page: 'cinema' });
});

router.get('/surgery', (req, res) => {
	res.render('surgery', { page: 'surgery' });
});

router.get('/library', (req, res) => {
	blog.find().sort({created_at: -1}).exec((err, posts) => {
		res.render('library', {
			page: 'library',
			posts: posts,
			admin: false
		})
	})
});

router.get('/library/post/:post', (req, res) => {
	blog.find({_id: req.params.post}, (err, posts) => {
		res.render('library', {
			page: 'library',
			posts: posts,
			admin: false
		})
	})
});

router.get('/studio', (req, res) => {
	studiopost.find().sort({created_at: -1}).exec((err, posts) => {
		res.render('studio', {
			page: 'studio',
			posts: posts,
			admin: false
		})
	})
});

// Display stored media files
router.get('/media/:filename', (req, res) => {
	var filename = req.params.filename;
	var collection = /song/.test(filename) ? 'studio_audio' : /artwork/.test(filename) ? 'studio_artwork' : 'post_media';
	gfs.collection(collection);

	gfs.files.findOne({ filename: filename }, (err, file) => {
		// Check if file exists
		if (!file || file.length === 0) {
			return res.status(404).json({
				err: 'File does not exist'
			});
		}

		// Read output to browser
		const readstream = gfs.createReadStream(file.filename);
		readstream.pipe(res);
	});
});

module.exports = router;