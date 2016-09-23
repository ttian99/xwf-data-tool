var fs = require('fs');
var fsw = require('./lib/fs-write.js');
var fsr = require('./lib/fs-read.js');
var xlsx = require('./lib/xlsxToJson.js');
var _ = require('lodash');
var async = require('async');
var cfg = require('./lib/cfg.js');

var resource = './res/test.xlsx';
var dstDir = './out/';
var extName = '.json';

// 判断文件路径是否存在
function checkOutDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}

// 读取project.json配置文件
fsr('./project.json', function(err, data) {
	if (err) console.log(err);
	cfg = data;
	// 初始化默认编码
	var initAreaCode = require('./lib/area-code-def.js');
	initAreaCode(cfg);
	// 检测文件夹是否存在
	checkOutDir(cfg.outDir);
	// 输出表格名数组
	var sheetArr = cfg.schoolOutArr;
	// getData(sheetArr);
	_.map(sheetArr, school2Village);
});

// 提取表格数据
function getXslxData(res, dst, sheetName, cb) {
	xlsx(res, dst, sheetName, function(err, data) {
		if (err) {
			console.log('xslxToJson err: ' + err);
			cb && cb(err)
			return;
		}
		var jsonStr = JSON.stringify(data);
		// console.log('xslxToJson data : ' + jsonStr);
		cb && cb(null, data)
	});
}

// 小区对应学校
function school2Village(item, id) {
	var sheetName = item;
	console.log('-- read sheet: ' + sheetName);
	var s2vJson = cfg.outDir + sheetName + '-学校对应小区' + cfg.extName;
	var schoolJson = cfg.outDir + sheetName + '-学校' + cfg.extName;
	var villageJson = cfg.outDir + sheetName + '-小区' + cfg.extName;
	async.waterfall([
		function(callback) {
			getXslxData(cfg.oralRes, s2vJson, sheetName, function(err, data) {
				callback(null, data);
			})
		},
		function(arg1, callback) {
			var s2vArr = []; // 学校对应小区数组
			var schoolArr = []; // 学校数组
			var villageArr = []; // 城市数组

			// 格式化数组
			arg1 = formatArr(sheetName, arg1);

			_.map(arg1, function(some, idx) {
				var key = some['招生学校'];
				var range = some['招生范围'];

				var rangeArr = [];
				if (checkSelf(range)) {
					rangeArr.push(range);
				} else {
					rangeArr = range.split(',');
				}
				// console.log("== rangeArr = " + JSON.stringify(rangeArr));

				// 去除无效值
				rangeArr = delInvalidValue(rangeArr);

				var obj = {};
				obj[key] = rangeArr;
				s2vArr.push(obj);
				schoolArr.push(some['招生学校']);
				villageArr = villageArr.concat(rangeArr);

				var len = arg1.length;
				if (idx === len - 1) {
					// 过滤掉数组的假值
					_.compact(s2vArr);
					_.compact(schoolArr);
					_.compact(villageArr);
					callback(null, s2vArr, schoolArr, villageArr);
				}
			});
		}
	], function(err, s2vArr, schoolArr, villageArr) {
		if (err) {
			console.log('there is some error for async');
			return;
		}
		var s2vStr = JSON.stringify(s2vArr);
		var schoolStr = JSON.stringify(schoolArr);
		var villageStr = JSON.stringify(villageArr);

		fsw(s2vJson, s2vStr);
		fsw(schoolJson, schoolStr);
		fsw(villageJson, villageStr);
	});
}

// 格式化数组
function formatArr(sheetName, arr) {
	var jsonStr = JSON.stringify(arr);
	// 全角逗号转换为半角
	jsonStr = jsonStr.replace(/，/g, ',');

	// 替换'&#10;'为'，'
	jsonStr = jsonStr.replace(/&#10;/g, ',');

	if (sheetName === '福田') {
		// 去掉类似'10：'开头的数字
		jsonStr = jsonStr.replace(/\d+：/g, '');
	}

	var reArr = JSON.parse(jsonStr);
	return reArr;
}

// 检查是否是民办开头的
function checkSelf(str) {
	var regSelf = new RegExp('^私立', 'g');
	var regSelf2 = new RegExp('^民办', 'g');
	var isSelfSchool = regSelf.test(str);
	var isSelfSchool2 = regSelf2.test(str);
	var ret = isSelfSchool || isSelfSchool2;
	return ret;
}

// 剔除无效值
function delInvalidValue(arr) {
	var tmpArr = arr;
	var len = arr.length;
	var reArr = _.remove(tmpArr, function(n) {
		return n && (n !== '无');
	});
	return reArr;
}