var express = require('express'),
	app = express(),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	http = require('http'), // core module
	path = require('path'), // core module
	session = require('express-session'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	ejs = require('ejs'),
	s3 = null;

process.env.PWD ? require('dotenv').config() : s3 = new require('aws-sdk').s3({DB: process.env.DB});

let conn = mongoose.connection;
mongoose.connect(process.env.DB || s3.DB);

conn.once('open', () => { console.log('Connected to db'); });
conn.on('error', (err) => { console.log(err); });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function (req, res, next) {
	res.locals.url = req.url;
	next();
});

app.use('/', require('./routes/index'));
app.use('/admin/library/', require('./routes/admin-library'));
app.use('/admin/studio/', require('./routes/admin-studio'));

var port = process.env.PORT || 1113;
app.listen(port, function() {
	console.log('Server started on port '+ port);
});