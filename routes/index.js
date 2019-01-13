var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var blog = require('../models/blogpost');
var studiopost = require('../models/studiopost');
var News = require('../models/newsfeed');
var colspan = 2;

function split_equally(arr, n, final) {
	if (arr.length == undefined) arr = [arr]; // checking if arr is array, as all arrays have 'length' prop
	let tempArr = [], row = [];
	final = final || [];

	arr.forEach(elm=>{ tempArr.push(elm) });

	for (var i = 0; i < n; i++) {
		let col = tempArr.shift();
		if (col) row.push(col);
	}

	final.push(row);

	if (tempArr.length) {
		return split_equally(tempArr, n, final)
	} else {
		return final
	}
}

let conn = mongoose.connection;
let gfs;

conn.once('open', function() {
	gfs = Grid(conn.db, mongoose.mongo);
});
// ===================================================

router.get('/', (req, res) => {
	res.render('index', { page: 'home' });
});

router.get('/colspan', (req, res) => {
	res.send({colspan: colspan});
});

router.get('/admin', (req, res) => {
	blog.find().sort({created_at: -1}).exec((err, posts) => {
		res.render('admin', {
			page: 'admin',
			posts: posts
		});
	});
});

router.get('/cinema', (req, res) => {
	News.find().sort({created_at: -1}).exec((err, news_items) => {
		res.render('cinema', {
			page: 'cinema',
			items: news_items
		});
	});
});

router.get('/surgery', (req, res) => {
	News.find().sort({created_at: -1}).exec((err, news_items) => {
		res.render('surgery', {
			page: 'surgery',
			items: news_items
		});
	});
});

router.get('/library', (req, res) => {
	News.find().sort({created_at: -1}).exec((err, news_items) => {
		blog.find().sort({created_at: -1}).exec((err, posts) => {
			res.render('library', {
				page: 'library',
				posts: posts,
				postsSplit: split_equally(posts, colspan),
				items: news_items
			})
		})
	});
});

router.get('/library/post/:id', (req, res) => {
	News.find().sort({created_at: -1}).exec((err, news_items) => {
		blog.findById(req.params.id, (err, posts) => {
			res.render('library', {
				page: 'library',
				posts: posts ? [posts] : null,
				postsSplit: posts ? split_equally(posts, colspan) : null,
				items: news_items
			})
		})
	});
});

router.get('/studio', (req, res) => {
	News.find().sort({created_at: -1}).exec((err, news_items) => {
		studiopost.find((err, posts) => {
			studiopost.findById(posts[0]._id, (err, post) => {
				res.render('studio', {
					page: 'studio',
					post: post,
					items: news_items
				})
			})
		})
	});
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