const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const config = require('../config/config');
const blog = require('../models/blogpost');

// Set The Storage Engine
const storage = new GridFsStorage({
	url: config.db,
	file: (req, file) => {
		blog.find().sort({created_at: -1}).exec((err, posts) => {
			var id = posts[0]._id;
			return new Promise((resolve, reject) => {
				crypto.randomBytes(10, (err, buf) => {
					if (err) return reject(err);
					const fileInfo = {
						filename: "m" + id + buf + path.extname(file.originalname),
						bucketName: 'post_media'
					};
					resolve(fileInfo);
				});
			});
		});
	}
});

// Init Upload
const upload = multer({
	storage: storage,
	limits:{fileSize: 1000000},
	fileFilter: function(req, file, cb){
		checkFileType(file, cb);
	}
});

// Check File Type
function checkFileType(file, cb){
	// Allowed ext
	const filetypes = /jpeg|jpg|png/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null,true)
	} else {
		cb('Error: Images Only!')
	}
}

module.exports = upload;