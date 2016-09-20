var fs = require('fs');

module.exports = function readFile(res, cb) {
	fs.readFile(res, function(err, data) {
		var ret = null;
		if (err) {
			console.log(err);
			cb && cb(err, ret);
			return;
		}

		try {
			ret = JSON.parse(data);
			cb && cb(err, ret);
			// return ret;
		} catch (e) {
			console.log('-- json parse error --');
			console.log(e);
			cb && cb(e, ret);
		}
	});
}