var fs = require('fs');

module.exports = function writeFile(dst, str, cb){
	fs.writeFile(dst, str, 'utf-8', function(err, data) {
		if(err){
			console.log(err);
			cb && cb(err, data);
			return;
		} else {
			console.log("-- file have writeFile at " + dst);
			cb && cb(null, data);
		}
	});
}