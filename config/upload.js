const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

// Set The Storage Engine
const storage = new GridFsStorage({
	url: config.db,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (err, buf) => {
				if (err) return reject(err);
				var pre = /artwork/.test(file.fieldname) ? "artwork" : /song/.test(file.fieldname) ? "song" : "";
				resolve({
					filename: pre + buf.toString('hex') + path.extname(file.originalname),
					bucketName: /song|artwork/.test(file.fieldname) ? 'studio_media' : 'post_media'
				});
			});
		});
	}
});

// Init Upload
const upload = multer({
	storage: storage,
	fileFilter: function(req, file, cb){
		checkFileType(file, cb);
	}
});

// Check File Type
function checkFileType(file, cb){
	// Allowed ext
	const filetypes = /jpeg|jpg|png|mp3/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null,true)
	} else {
		cb('Error: Images / Music Only!')
	}
}

module.exports = upload;