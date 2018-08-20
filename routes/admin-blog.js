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

router.get('/', (req, res) => {
	res.render('admin_newpost', {
		page: 'library admin'
	});
});

router.post('/submit', (req, res) => {
	var newPost = new blog({
		title: req.body.title,
		subtitle: req.body.subtitle,
		textbody: req.body.textbody,
		tags: req.body.tags ? req.body.tags.split(',') : []
	});
	newPost.save(err => {
		if (err) throw err;
		res.send('/library')
	});
});

router.post('/media/upload', (req, res) => {
	var image = upload.single('img'); // fieldname
	// new upload process
	image(req, res, err => {
		if (err) {
			console.log(err);
			return res.redirect(req.get('referer'));
		}
		gfs.files.find().sort({uploadDate: -1}).toArray((err, imgs) => {
			var img = imgs[0].filename;
			blog.find().sort({created_at: -1}).exec((err, posts) => {
				posts[0].mediaList.push(img);
				posts[0].save(err => {
					if (err) throw err;
					res.redirect('/library');
				});
			})
		})
	});
});

router.post('/delete', (req, res) => {
	var deleting = () => {
		blog.deleteOne({ _id: req.body.id }, (err, result) => {
			if (err) return err;
			return res.send('/library');
		});
	};

	blog.findById(req.body.id, (err, post) => {
		if (post.mediaList.length) {
			clearMedia(gfs, post.mediaList, (err) => {
				if (err) return err;
				deleting();
			});
		} else {
			deleting();
		}
	})
});

module.exports = router;
