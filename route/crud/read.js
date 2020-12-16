const fs = require('fs');
var read = {
	readList(url, callback) {
		fs.readFile(url, 'utf8', (err, data) => {
			if (err) {
				callback && callback({
					status: 400,
					msg: '查找失败'
				});
			} else {
				callback && callback({
					status: 200,
					data: JSON.parse(data)
				});
			}

		});
	},
	// 读取data目录下的文件和文件夹
	readdir: function(callback) {
		fs.readdir('./data', function(err, files) {
			var obj = null;
			if (err) {
				obj = {
					status: 400,
					files: err
				};
			} else {
				obj = {
					status: 200,
					files: files
				};
			}
			callback && callback(obj);
		});
	}
}

module.exports = read;
