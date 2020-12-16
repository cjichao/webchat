const fs = require('fs');
var write = {
	writeList(url, data, callback) {
		fs.writeFile(url, data, 'utf8', (err) => {
			if (err) {
				console.log(err);
			} else {
				callback && callback();
				// console.log(data);
			}
		});
	},
	writeImg: function(url, data, callback) {
		fs.writeFile(url, data, (err) => {
			if (err) {
				console.log(err);
			} else {
				callback && callback();
				// console.log(data);
			}
		});
	},
	// 创建目录
	mkdir: function(dir, callback) {
		// 文件夹名称不能为空之类，不能为特殊字符，只能是数字字母
		if (dir !== '' && dir !== nulldir !== undefined) {
			fs.mkdir('data/' + dir, function(err) {
				var obj = null;
				if (err) {
					obj = {
						status: 400,
						msg: err
					};
				} else {
					obj = {
						status: 200,
						msg: '创建成功'
					};
				}
				callback && callback(obj);
			})
		} else {

		}

	}
}

module.exports = write;
