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
				var pre;
				var bucketName;
				switch (file.fieldname) {
					case 'song':
						pre = "song";
						bucketName = "studio_audio";
						break;

					case 'artwork':
						pre = "artwork";
						bucketName = "studio_artwork";
						break;

					case 'news_image':
						pre = "news";
						bucketName = "news_images";
						break;

					default:
						pre = "";
						bucketName = "post_media";
				}
				resolve({
					filename: pre + buf.toString('hex') + path.extname(file.originalname),
					bucketName: bucketName
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