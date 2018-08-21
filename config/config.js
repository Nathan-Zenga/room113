module.exports = {
	db: 'mongodb://nathanzen:thomas96@ds123852.mlab.com:23852/room113',
	clearMedia: (gfs, mediaList, rootCollection, cb) => {
		if (typeof mediaList == 'object') {
			mediaList.forEach(filename => {
				gfs.remove({filename: filename, root: rootCollection},  (err, gridStore) => {
					if (err) return cb(err);
				})
			});
		} else {
			var ref = mediaList;
			gfs.remove({filename: ref, root: rootCollection},  (err, gridStore) => {
				if (err) return cb(err);
			})
		}
		cb();
	}
}