const express = require('express');
const read = require('./crud/read.js');
const write = require('./crud/write.js');
const router = express.Router();

router.use((req, res, next) => {
	next()
})
// 注册获取id ,(id唯一)
router.get('/getid', (req, res, next) => {
	var json = './data/userid.json';
	read.readList(json, function(data) {
		var status = data.status;
		var obj = data.data;
		if (status === 200) {
			// {
			// 	"usernum":10,
			// 	"useridnext":"000010"
			// }
			console.log(data)
			res.json({
				userid: obj.useridnext
			})
		} else if (status === 400) {
			res.json({
				status: 400,
				msg: data.msg
			});
		}
	})

});

router.post('/login', (req, res, next) => {
	var body = req.body;
	var userid = body.userid;
	var password = body.password;
	// 所有用户列表users.json
	var json = './data/users.json';
	read.readList(json, function(data) {
		var status = data.status;
		if (status === 200) {
			var userList = data.data;
			var obj = {
				status: 200,
				data: {
					status: 401,
					msg: '登录失败，没有该用户'
				}
			};
			var user = {};
			for (var i = 0, len = userList.length; i < len; i++) {
				user = userList[i];
				if (userid === user.userid) {
					if (password === user.password) {
						obj.data.status = 200;
						obj.data.data = user;
						obj.data.msg = '登录成功';
						user.isOnline = true;
					} else {
						obj.data.status = 403;
						obj.data.msg = '登录失败，密码错误';
					}
					break;
				}
			}
			write.writeList(json, JSON.stringify(userList));
			res.json(obj);
		} else if (status === 400) {
			res.json({
				status: 400,
				msg: data.msg
			});
		}
	});
})

router.post('/getfriends', (req, res, next) => {
	var body = req.body;
	var userid = body.userid;
	read.readList('./data/' + userid + '/friends.json', function(data) {
		var status = data.status;
		if (status === 200) {
			res.json({
				status: 200,
				data: data.data
			})
		} else if (status === 400) {
			res.json({
				status: 400,
				msg: data.msg
			})
		}

	});
});

router.post('/logout', (req, res, next) => {
	var body = req.body;
	var userid = body.userid;
	// 所有用户列表users.json
	var json = './data/users.json';
	read.readList(json, function(data) {
		var status = data.status;
		if (status === 200) {
			var userList = data.data;
			var obj = {
				status: 200,
				data: {
					status: 401,
					msg: '登出失败，没有该用户'
				}
			};
			var user = {};
			for (var i = 0, len = userList.length; i < len; i++) {
				user = userList[i];
				if (userid === user.userid) {
					obj.data.status = 200;
					obj.data.msg = '登出成功';
					user.isOnline = false;
					break;
				}
			}
			write.writeList(json, JSON.stringify(userList));
			res.json(obj);
		} else if (status === 400) {
			res.json({
				status: 400,
				msg: data.msg
			});
		}
	});
})

router.post('/upload', function(req, res) {
	//接收前台POST过来的base64
	var imgData = req.body.imgData;
	var userid = req.body.userid;
	var type = req.body.type;
	// console.log(imgData)
	//过滤data:URL
	var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
	// var dataBuffer = new Buffer(base64Data, 'base64');
	var dataBuffer = Buffer.from(base64Data, 'base64');
	// console.log(dataBuffer)
	var imgurl = "data/imghead/" + userid + "head." + type;
	write.writeImg(imgurl, dataBuffer, function(err) {
		res.json({
			status: 200,
			imgurl: imgurl,
			msg: "头像成功！"
		});

	});
});

module.exports = router;
