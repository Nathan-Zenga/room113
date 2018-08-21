const mongoose = require('mongoose');
const multer = require('multer');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

let conn = mongoose.connection;

let gfs;
conn.once('open', function() {
	gfs = Grid(conn.db, mongoose.mongo);
});
// ===================================================

// Set The Storage Engine
const storage = new GridFsStorage({
	url: config.db,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (err, buf) => {
				if (err) return reject(err);
				var collection = /audio/.test(file.mimetype) ? 'studio_media' : 'post_media';
				gfs.collection(collection);

				var lastly = () => {
					resolve({
						filename: buf.toString('hex') + path.extname(file.originalname),
						bucketName: collection
					});
				}

				if (collection === 'studio_media') {
					gfs.files.find((err, files) => {
						gfs.remove({_id: files[0]._id, root: 'studio_media'}, (err, gridStore) => {
							if (err) return err;
							lastly()
						})
					})
				} else {
					lastly()
				}
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