var xlsxj = require("xlsx-to-json");

/**
*	xlsxToJson
*/ 
module.exports = function xlsxToJson(input, output, sheetName, cb) {
	if (!input) {
		console.log('input cannot null!');
		cb && cb('input cannot null!')
	}
	if (!output) {
		console.log('output cannot null!');
		cb && cb ('output cannot null!');
	}
	xlsxj({
		input: input,
		output: null,
		sheet: sheetName
	}, function(err, result) {
		if (err) {
			console.error(err);
			cb && cb (err);
		} else {
			// console.log(result);
			cb && cb (null, result);
		}
	});
}

