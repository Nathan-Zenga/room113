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
	},
	splitPerRow: function divide(arr, n, final) {
		if (arr.length == undefined) arr = [arr]; // checking if obj type is array, as all arrays have 'length' prop
		if (final == undefined) final = [];
		let tempArr = [];

		arr.forEach(elm=>{ tempArr.push(elm) });

		let row = tempArr.slice(0, n);
		tempArr = tempArr.slice(n);
		final.push(row);

		if (tempArr.length) {
			return divide(tempArr, n, final)
		} else {
			return final
		}
	}
}