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
	gfs.collection('post_media');
});
// ===================================================

router.get('/', (req, res) => {
	res.render('index', { page: 'home' });
});

router.get('/cinema', (req, res) => {
	res.render('cinema', { page: 'cinema' });
});

var isAdmin = (res, coll, page, bool) => {
	coll.find().sort({created_at: -1}).exec((err, posts) => {
		res.render(page, {
			page: page,
			posts: posts,
			admin: bool
		})
	})
}

router.get('/library', (req, res) => {
	isAdmin(res, blog, 'library', false);
});

router.get('/admin/library', (req, res) => {
	isAdmin(res, blog, 'library', true);
});

router.get('/studio', (req, res) => {
	isAdmin(res, studiopost, 'studio', false);
});

router.get('/admin/studio', (req, res) => {
	isAdmin(res, studiopost, 'studio', true);
});

// Display stored media files
router.get('/media/:filename', (req, res) => {
	gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
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