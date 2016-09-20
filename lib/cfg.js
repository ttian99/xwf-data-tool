var cfg = {
	init: function(cb) {
		console.log('-----------init cfg --------');
		this._readConfig(cb);
	},

	_readConfig: function(cb) {
		var self = this;
		var fsr = require('./fs-read.js');
		// 读取要输出的配置信息
		fsr('../project.json', function(err, data) {
			if (err) console.log(err);
			cfg = data;
			self._initAreaCode();
			self._checkDir();
			cb && cb(cfg);
		});
	},

	_initAreaCode: function() {
		console.log('-------- init area code ----');
		var initAreaCode = require('./area-code-def.js');
		initAreaCode(cfg);
	},

	// 判断文件路径是否存在
	_checkDir: function() {
		console.log('-------- checkDir -------');
		if (!fs.existsSync(cfg.outDir)) {
			fs.mkdirSync(cfg.outDir);
		}
		if (!fs.existsSync(cfg.v2sDir)) {
			fs.mkdirSync(cfg.outDir);
		}
	},

};

module.exports = cfg;