module.exports = {
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