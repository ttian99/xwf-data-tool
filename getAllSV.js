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

	main(sheetArr);
});

function main(sheetArr) {
	var schoolArr = [];
	var schoolStr = '';
	var schoolStrHead = 'var schoolArr = \t\n';
	var schoolStrEnd = "\t\nif (typeof(module) !== 'undefined') {\t\n module.exports = schoolArr \t\n};";
	var len = sheetArr.length - 1;
	_.map(sheetArr, function(item, id) {
		var sheetName = item;
		var arr = getSchoolArr(sheetName, function(err, data) {
			var arrHead = "/************************" + sheetName + "*****************************/";
			schoolArr = schoolArr.concat(data);
			if (id === len) {
				console.log(schoolArr.length);
				schoolStr = schoolStrHead + JSON.stringify(schoolArr) + schoolStrEnd;
				outPutJson(schoolStr);
			}
		});
	});
};


function getSchoolArr(sheetName, cb) {
	console.log('------ read ' + sheetName + ' file -----');
	var s2vJson = cfg.outDir + sheetName + '-学校对应小区' + cfg.extName;
	fsr(s2vJson, function(err, data) {
		cb(err, data);
	});
}


function outPutJson(str) {
	var outPath = './lib/xwf-s2v-data.js';
	fsw(outPath, str, function(err, data) {
		console.log('-- output over --');
	});
}