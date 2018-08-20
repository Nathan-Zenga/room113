module.exports = {
	db: 'mongodb://nathanzen:thomas96@ds123852.mlab.com:23852/room113',
	clearMedia: (gfs, mediaList, cb) => {
		mediaList.forEach(filename => {
			gfs.remove({filename: filename, root: 'post_media'},  (err, gridStore) => {
				if (err) return cb(err);
			})
		});
		cb();
	}
}