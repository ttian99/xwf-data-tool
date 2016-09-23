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
	var sheetArr = cfg.lockOutArr;

	main(sheetArr);
});

function main(sheetArr) {
	var villageObj = {};
	var villageStr = '';
	var villageStrHead = 'var village2SchoolObj = \t\n';
	var villageStrEnd = "\t\nif (typeof(module) !== 'undefined') {\t\n module.exports = village2SchoolObj; \t\n}";
	var len = sheetArr.length - 1;
	_.map(sheetArr, function(item, id) {
		var sheetName = item;
		var arr = getVillageArr(sheetName, function(err, data) {
			console.log("-- " + sheetName + " size = " + _.size(data));
			_.merge(villageObj, data);
			if (id === len) {
				console.log("finalSize = " + _.size(villageObj));
				villageStr = villageStrHead + JSON.stringify(villageObj) + villageStrEnd;
				outPutJson(villageStr);
			}
		});
	});
};


function getVillageArr(sheetName, cb) {
	console.log('------ read ' + sheetName + ' file -----');
	var v2sJson = cfg.outDir + sheetName + '-小区对应学校' + cfg.extName;
	fsr(v2sJson, function(err, data) {
		cb(err, data);
	});
}


function outPutJson(str) {
	var outPath = './data/xwf-v2s-data.js';
	fsw(outPath, str, function(err, data) {
		console.log('-- output over --');
	});
}