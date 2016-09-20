var arr = [
	'上步中路1045号深勘大院平房101',
	'深勘大院保安岗亭101',
	'上步中路1045号深勘大院2栋101',
	'上步中路1045号深勘大院2栋102',
	'上步中路1045号深勘大院2栋深勘大院2栋101',
	'深勘大院公共厕所102号',
	'深勘大院保安岗亭公共厕所',
	'深勘大院2号909号'
];

var def = {
	"深勘大院": {
		"保安岗亭": ["101"]
	}
}

var _ = require('lodash');


// var testStr1 = "公共厕所808号"; 
// var testStr2 = "707号";
// var strArr = testStr1.split('');
// console.log("strArr = " + strArr)
// var endPos = _.findLastIndex(strArr, function(item) {
// 	// var bb = /[A-Za-z0-9][^A-Za-z0-9]$/.exec(item);
// 	var bb = /[A-Za-z0-9]+ [\u4E00-\u9FA5]$/.exec(item);
// 	return bb;
// });
// console.log('endPos = ' + endPos)	
// return;


/**********
    "上步中路1045号深勘大院2栋101" => "上步中路1045号深勘大院" "2栋" "101"
    "上步中路" "1045号深勘大院2栋" "101"
    
    "深勘大院保安岗亭101"  => "深勘大院" "保安岗亭" "101"
    "深勘大院保安岗亭" "101"

    "深勘大院公共厕所102号" => "深勘大院" "公共厕所" "102号"
*************/

var words = '深勘大院';
var str = arr[4];
var eObj = {}

// 获取栋数与楼层
function getIndex(str, words) {
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
	// console.log('key = ' + key);

	// 找到末尾数字的起始位置
	console.log("right = " + right);
	var strArr = right.split('');
	var endPos = _.findLastIndex(strArr, function(item) {
		// var bb = /[^A-Za-z0-9]$/.exec(item);
		var bb = /[\u4E00-\u9FA5\uF900-\uFA2D]$/.exec(item);
		return bb;
	});

	var bArr = [];
	var len = strArr.length;
	var building = right.slice(0, endPos + 1);
	var room = right.slice(endPos + 1, len)
	// console.log('len = ' + len);
	// console.log('endPos = ' +　endPos);
	// bArr.building = right.slice(0, endPos + 1);
	// bArr.room = right.slice(endPos + 1, len)

	// if (endPos + 1 === len) {
	// 	right.slice();
	// }
	// console.log(bArr)
	if (eObj[key] && eObj[key][building]) {
		eObj[key][building].push(room);
	} else {
		eObj[key] = {};
		eObj[key][building] = [];
		eObj[key][building].push(room);
	}
	
}


var newArr = []
_.map(arr, function(item, id) {
	console.log('== item = ' + item);
	var idx = getIndex(item, words);
	// console.log('-- idx = ' + idx);


	// var len = item.length;
	// // console.log(typeof(item));
	// var pos = item.lastIndexOf(words);
	// console.log(pos);
	// var idx = -pos;
	// var subStr = item.substr(idx);
	// console.log(subStr);
	// newArr.push(subStr);
	// // var reg = new Regexp(words, 'g');
	// // var reg = '/'+ words + '/g';
	// // reg.exec();
	if (id === arr.length - 1) {
		console.log(eObj);
	};
});