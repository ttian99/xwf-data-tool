var fs = require('fs');
var fsr = require('./lib/fs-read.js');
var fsw = require('./lib/fs-write.js');
var psql = require('./psql.js');
var _ = require('lodash');
var cfg = null;
var async = require('async');
var v2sObj = require('./lib/xwf-v2s-data.js');

var isSearch = false;


// 判断文件路径是否存在
function checkOutDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

// 读取project.json配置文件
fsr('./project.json', function(err, data) {
  if (err){
  	console.log('-- read project fail --');
    console.log(err);
    return;
  } 
  cfg = data;
  // 初始化默认编码
  var initAreaCode = require('./lib/area-code-def.js');
  initAreaCode(cfg);
  // 检测文件夹是否存在
  checkOutDir(cfg.v2sDir);
  // 输出表格名数组
  var sheetArr = cfg.outArr;

  var idx = cfg.idx;
  idx = addIdx(idx);
  
  startApp(idx);
});


function startApp(idx) {
  console.log('-- startApp idx : ' + idx + ' --');
  var words = getWords(idx);

  if (!words) {
    console.log('-- getWords error --');
    return;
  }
  reqData(words, idx);
}

// 记录值+1
function addIdx(idx) {
  if (!idx) {
    console.log('-- idx error!!! --');
    idx = '402-00000';
    return idx;
  }
  var str = idx + '';
  var head = str.slice(0, 4);
  var end = str.slice(4);
  var num = parseInt(end);
  num++;
  console.log('head = ' + head + ' | end = ' +end + ' | num = ' + num);
  var code = _.padStart(num + '', 5, '0');
  var newIdx = head + code;
  console.log('-- newIdx = ' + newIdx);
  return newIdx;
}

// 获取关键字
function getWords(idx) {
  if (idx === '402-00941' ) {
    idx = '404-00000';
  } else if (idx === '404-00092') {
    idx = '8010';
  }
  var key = _.findKey(v2sObj, {'idx': idx});
  return key ? key : '';
}

// 请求数据库数据
function reqData(words, idx) {
  console.log('-- reqData words : ' + words + ' , idx : ' + idx + ' --');

  async.waterfall(
    [
      function(callback) {
        psqlReq(words, function(err, data) {
          console.log('-- get the res --');
          if (data.length < 1) {
          	callback('NULLDB')
          } else {
			// 记录原始数据
			var jsonStr = JSON.stringify(data);
			callback(null, data);
          }
          
          // var dst = cfg.v2sDir + idx + "-oral" + cfg.extName;
          // outFile(jsonStr, dst, function() {
          //   callback(null, data);
          // });
        });
      },
      function(oralArr, callback) {
        keyMode(words, oralArr, function(err, data) {
          callback(err, data);
        })
      }
    ],
    function(err, result) {
      // console.log('------ waterfall over ------');
      if (err === 'NULLDB') {
      	console.log('---- the db is not find the words : ' + words);
      	saveIdx(idx);
      }  else {
		var jsonStr = JSON.stringify(result);
		var dst = cfg.v2sDir + idx + cfg.extName;
		outFile(jsonStr, dst, function() {
			console.log('----- out file : ' + dst + ' ----');
			saveIdx(idx);
		});
      }
    });
}

// psql请求
function psqlReq(words, cb) {
  var sqlStr = "select * from room where houseaddress like '%" + words + "%'";
  psql(sqlStr, cb);
  // psql(sqlStr, function(err, data) {
  //   var jsonStr = JSON.stringify(data);
  //   // console.log('data = ' + jsonStr);

  //   // var dst = './' + words + '.json';
  //   // var dst = cfg.v2sDir + '402-00001' + cfg.extName; 
  //   // outFile(jsonStr, dst);
  //   cb && cb(err, data);
  // });
}

// 写入数据到文件
function outFile(jsonStr, dst, cb) {
  fs.writeFile(dst, jsonStr, 'utf-8', function(err, data) {
    if (err) {
      console.log(err);
      cb && cb(err, data);
      return;
    }
    console.log("-- data file have writeFile at " + dst);
    cb && cb(null, data);
  });
}

// 获取关键字词组
function getKeyArr(words, arr, cb) {
  var tmp = [];
  _.map(arr, function(item, id) {
    var str = item['houseaddress'];
    // 去掉多余的空格
    str = _.trim(str);
    var strArr = str.split('');
    // log.debug("strArr = ", JSON.stringify(strArr));
    // 找到数字开始的位置
    var startPos = _.findIndex(strArr, function(item) {
      var aa = /^[0-9]*$/.exec(item);
      return aa;
    });
    // 提取数字前面部分的字符串
    var match = _.slice(strArr, 0, startPos);
    var goodStr = match.join("");
    tmp.push(goodStr);

    // log.debug('goodStr = ', goodStr);

    if (id === arr.length - 1) {
      // 数组去重
      tmp = _.uniq(tmp);
      cb(null, tmp);
    }
  });
}

// 数字模式
function numMode(words, arr, cb) {
  var tmp = [];
  var obj = {};
  console.log('----- start --- map ------ arr ------');
  _.map(arr, function(item, id) {
    var str = item['houseaddress'];
    // 去掉多余的空格
    str = _.trim(str);
    var strArr = str.split('');
    // log.debug("strArr = ", JSON.stringify(strArr));
    // 找到数字开始的位置
    var startPos = _.findIndex(strArr, function(item) {
      var aa = /^[0-9]*$/.exec(item);
      return aa;
    });

    var endPos = _.findLastIndex(strArr, function(item) {
      var bb = /[\u4E00-\u9FA5\uF900-\uFA2D]$/.exec(item);
      return bb;
    });

    var bArr = []; // 房间数组
    var len = strArr.length;
    // 截取关键字
    var key = str.slice(0, startPos);
    // 截取栋数
    var building = str.slice(startPos, endPos + 1);
    // 截取房间
    var room = str.slice(endPos + 1, len);
    console.log('key = ' + key);
    console.log('building = ' + building);
    console.log('room = ' + room);

    // 数组去重
    if (obj[key] && obj[key][building]) {
      obj[key][building].push(room);
    } else {
      obj[key] = {};
      obj[key][building] = [];
      obj[key][building].push(room);
    }

    if (id === arr.length - 1) {
      // 数组去重
      // tmp = _.uniq(tmp);
      console.log('----- map over ------');
      cb(null, obj);
    }
  });
}

// 关键字模式
function keyMode(words, arr, cb) {
  var obj = {};
  console.log('----- start --- map ------ arr ------');

  var arrLen = arr.length;
  _.map(arr, function(item, id) {
    var str = item['houseaddress'];
    // 去掉多余的空格
    str = _.trim(str);
    // var strArr = str.split('');

    var tmpStr = str;
    // 匹配关键字words，并替换为","
    var reg = new RegExp(words, 'g');
    tmpStr = tmpStr.replace(reg, ",");
    // 利用","分割字符串为数组, 提取数组最后一部分right（包含栋数+房号）
    var tmpArr = tmpStr.split(",");
    var len = tmpArr.length - 1;
    var right = tmpArr[len];
    // 窃取关键字
    var key = _.trimEnd(str, right);

    // 找到末尾数字的起始位置
    // console.log("right = " + right);
    var strArr = right.split('');
    var endPos = _.findLastIndex(strArr, function(item) {
      // var bb = /[^A-Za-z0-9]$/.exec(item);
      var bb = /[\u4E00-\u9FA5\uF900-\uFA2D]$/.exec(item);
      return bb;
    });

    var bArr = []; // 房间数组
    var len = strArr.length;
    // 截取栋数
    var building = right.slice(0, endPos + 1);
    // 截取房间
    var room = right.slice(endPos + 1, len);
    // console.log('key = ' + key);
    // console.log('building = ' + building);
    // console.log('room = ' + room);

    // 判断关键字是否存在
    var isHaveKey = _.has(obj, key);
    if (!isHaveKey) {
      obj[key] = {};
    }

    // 判断楼栋数是否存在
    var isHaveBuilding = _.has(obj[key], building);
    if (!isHaveBuilding) {
      obj[key][building] = [];
    }

    var code = _.trim(item.code);
    var tmpObj = {};
    tmpObj.room = room;
    tmpObj.code = code;
    obj[key][building].push(tmpObj);

    // 数组去重
    // if (obj[key][building]) {
    //   obj[key][building].push(room);
    // } else {
    //   obj[key] = {};
    //   obj[key][building] = [];
    //   obj[key][building].push(room);
    // }
    // console.log('== arrLen = ' + arrLen);
    if (id === arrLen - 1) {
      // 数组去重
      console.log('----- map over ------');
      cb(null, obj);
    }
  });
}

// 保存记录下的idx
function saveIdx(idx) {
  cfg.idx = idx;
  var jsonStr = JSON.stringify(cfg);
  // 读取project.json配置文件
  fsw('./project.json', jsonStr, function(err, data) {
    if (err){
    	console.log('-- saveIdx error --')
      console.log(err);
    }

    idx = addIdx(idx);
    console.log('-- saveIdx over => idx : ' + idx + '--');
    startApp(idx);
  });
}


function getBuildingArr(key, arr, cb) {
  var tmp = [];
  _.map(arr, function(item, id) {
    var str = item['houseaddress'];
    var reg = new RegExp(key, 'g');
    if (!reg.test(str)) {
      // console.log('no');
    } else {
      str = _.trim(str); // 去掉多余的空格
      var strArr = str.split('');
      var startPos = _.findIndex(strArr, function(item) {
        var aa = /^[0-9]*$/.exec(item);
        return aa;
      });

      var endPos = _.findLastIndex(strArr, function(item) {
        var bb = /[^A-Za-z0-9]$/.exec(item);
        return bb;
      });

      var mPos = strArr.length - endPos - 1;

      var match = _.drop(strArr, startPos);
      match = _.dropRight(match, mPos);
      var goodStr = match.join("");
      // tmp.push({name: goodStr});
      tmp.push(goodStr);
    }

    if (id === arr.length - 1) {
      // 数组去重
      tmp = _.uniq(tmp);
      cb && cb(null, tmp);
    }
  });
}