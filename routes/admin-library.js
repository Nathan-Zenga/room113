var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var upload = require('../config/upload');
var clearMedia = require('../config/config').clearMedia;
var blog = require('../models/blogpost');

let conn = mongoose.connection;

let gfs;
conn.once('open', function() {
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('post_media');
});
// ===================================================

router.post('/post/submit', (req, res) => {
	var newPost = new blog({
		title: req.body.title,
		subtitle: req.body.subtitle,
		textbody: req.body.textbody,
		tags: req.body.tags ? req.body.tags.split(',') : []
	});
	newPost.save(err => {
		if (err) throw err;
		res.send('Done!')
	});
});

router.post('/post/media/upload', (req, res) => {
	var image = upload.array('img', Infinity); // fieldname
	// new upload process
	image(req, res, err => {
		if (err) {
			console.log(err);
			return res.redirect(req.get('referer'));
		}
		blog.find().sort({created_at: -1}).exec((err, posts) => {
			req.files.forEach(file => { posts[0].mediaList.push(file.filename) });
			posts[0].save(err => {
				if (err) throw err;
				res.send('Done!');
			});
		})
	});
});

router.post('/post/update', (req, res) => {
	blog.findById(req.body.id, (err, post) => {
		if (err) return err;
		post.title = req.body.title || post.title;
		post.subtitle = req.body.subtitle || post.subtitle;
		post.textbody = req.body.textbody || post.textbody;
		post.tags = req.body.tags || post.tags;
		post.save((err) => {
			if (err) return err;
			res.send("Post updated!");
		})
	})
});

router.post('/post/delete', (req, res) => {
	var deleting = () => {
		blog.deleteOne({ _id: req.body.id }, err => {
			if (err) return err;
			return res.send('/library');
		});
	};

	blog.findById(req.body.id, (err, post) => {
		if (post.mediaList.length) {
			clearMedia(gfs, post.mediaList, 'post_media', err => {
				if (err) return err;
				deleting();
			})
		} else {
			deleting();
		}
	})
});

module.exports = router;
