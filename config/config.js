module.exports = {
	db: 'mongodb://nathanzen:thomas96@ds123852.mlab.com:23852/room113',
	clearMedia: (gfs, list, rootCollection, cb) => {
		if (typeof list == 'object') {
			list.forEach(filename => {
				gfs.remove({filename: filename, root: rootCollection},  (err, gridStore) => {
					if (err) return cb(err);
				})
			});
		} else {
			var name = list;
			gfs.remove({filename: name, root: rootCollection},  (err, gridStore) => {
				if (err) return cb(err);
			})
		}
		cb();
	}
}