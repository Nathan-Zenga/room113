var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var blog = require('../models/blogpost');
var upload = require('../config/upload');

let conn = mongoose.connection;

let gfs;
conn.once('open', function() {
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('post_media');
});
// ===================================================

router.get('/', (req, res) => {
	res.render('index', { page: 'home' });
});

router.get('/cinema', (req, res) => {
	res.render('cinema', { page: 'cinema' });
});

router.get('/library', (req, res) => {
	blog.find((err, posts) => {
		gfs.files.find().toArray((err, files) => {
			res.render('library', {
				page: 'library',
				posts: posts,
				media: files
			})
		})
	})
});

router.get('/admin/newpost', (req, res) => {
	res.render('admin_newpost', { page: 'library admin' });
});

router.post('/admin/library/post', (req, res) => {
	var newPost = new blog({
		title: req.body.title,
		subtitle: req.body.subtitle,
		textbody: req.body.textbody,
		tags: req.body.tags.split(',')
	});

	if (req.body.img) {
		var icon = upload.single('img'); // field name

		// new upload process
		icon(req, res, err => {
			if (err) {
				// req.flash('error_msg', `${err}`);
				console.log(err);
			}
		});
	}

	newPost.save(err => { if (err) throw err; res.redirect('/library') });
});

// Display profile icon
router.get('/media/:filename', (req, res) => {
	gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
		// Check if file
		if (!file || file.length === 0) {
			return res.status(404).json({
				err: 'Icon does not exist'
			});
		}

		// Check if image
		if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
			// Read output to browser
			const readstream = gfs.createReadStream(file.filename);
			readstream.pipe(res);
		} else {
			res.status(404).json({
				err: 'Not an image'
			});
		}
	});
});

router.post('/send/message', (req, res) => {
	let empty = false;
	for (k in req.body) if (req.body[k] === '') empty = true;
	if (empty) return res.send("Please fill in the missing field(s)");
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		port: 465,
		secure: true,
		auth: {
			user: 'nznodemailer@gmail.com',
			pass: 'nodemailer246'
		},
		tls: {
			rejectUnauthorized: true
		}
	});

	let mailOptions = {
		from: `"${req.body.name}" <${req.body.email}>`,
		to: 'nathanzenga@gmail.com',
		subject: req.body.subject,
		text: req.body.message
	};

	transporter.sendMail(mailOptions, function(err, info) {
		if (err) return console.log(err);
		console.log("The message was sent!");
		console.log(info);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		res.send('Message sent');
	});
});

module.exports = router;