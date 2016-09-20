var fs = require('fs');
var fsw = require('./lib/fs-write.js');
var fsr = require('./lib/fs-read.js');
var xlsx = require('./lib/xlsxToJson.js');
var _ = require('lodash');
var async = require('async');

var cfg = null; // 配置文件


// 判断文件路径是否存在
function checkOutDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir)
	}
}

// 读取要输出的配置信息
fsr('./project.json', function(err, data) {
	if (err) console.log(err);
	cfg = data;
	// // 初始化默认编码
	// var initAreaCode = require('./lib/area-code-def.js');
	// initAreaCode(cfg);
	// console.log(cfg.preCode);
	// 检测文件夹是否存在
	checkOutDir(cfg.outDir);
	var sheetArr = cfg.outArr;
	_.map(sheetArr, function(item, id) {
		var sheetName = item;
		readSchoolArr(sheetName);
	});
});