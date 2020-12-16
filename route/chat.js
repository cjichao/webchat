const express = require('express');
const read = require('./crud/read.js');
const write = require('./crud/write.js');
const router = express.Router();
//在线用户
var onlineUser = {};
var onlineCount = 0;
router.use((req, res, next) => {
	next()
})
var IO = null;

function getFriendsList(userid, callback) {
	read.readList('./data/' + userid + '/friends.json', function(data) {
		var status = data.status;
		if (status === 200) {
			callback && callback(data.data);
		} else if (status === 400) {

		}
	});
}

function getUsersList(callback) {
	read.readList('./data/users.json', function(data) {
		var status = data.status;
		if (status === 200) {
			callback && callback(data.data);
		} else if (status === 400) {

		}
	});
}
// 写入socketid
function writeUserId(obj, socketid, callback) {
	read.readList('./data/users.json', function(data) {
		var status = data.status;
		if (status === 200) {
			var list = data.data;
			for (var i = 0, len = list.length; i < len; i++) {
				var item = list[i];
				if (obj.userid == item.userid) {
					item.socketid = socketid;
					break;
				}
			}
			callback && callback(list);
			write.writeList('./data/users.json', JSON.stringify(list), function(data) {

			});
		} else if (status === 400) {

		}
	});

}
router.io = function(io) {
	io.on('connection', function(socket) {
		// 获取自己的所有好友,登录的时候获取
		var friendsList = [];
		//监听新用户加入
		socket.on('login', function(obj) {
			socket.name = obj.userid;
			getFriendsList(obj.userid, function(data) {
				for (var i = 0, len = data.length; i < len; i++) {
					var item = data[i].friends;
					for (var j = 0, length = item.length; j < length; j++) {
						friendsList.push(item[j])
					}
				}
				console.log('好友数量', friendsList.length);
				writeUserId(obj, socket.id, function(list) {

					friendsList
					for (var n = 0, le = friendsList.length; n < le; n++) {
						var user = friendsList[n];
						for (var m = 0, leng = list.length; m < length; m++) {
							var u = list[m];
							// 是好友并且在线,通知这个好友我上线了
							if (u.userid == user.userid && u.socketid) {
								io.to(u.socketid).emit('shangxian', {
									socketid: socket.id,
									user: obj
								});
								break;
							}
						}
					}
				});
				// 只通知自己的好友上线了
				// for (var x = 0, l = friendsList.length; x < l; x++) {
				// 	var socketid = friendsList[x].socketid;
				// 	if (socketid) {
				// 		io.sockets.socket(socketid).emit('shangxian', {
				// 			socketid: socket.id,
				// 			user: obj
				// 		});
				// 	}
				// }
			});
			//检查用户在线列表
			if (!onlineUser.hasOwnProperty(obj.userid)) {
				onlineUser[obj.userid] = obj.username;
				//在线人数+1
				onlineCount++;
			}
			//广播消息,不发送给自己
			socket.broadcast.emit('login', {
				onlineUser: onlineUser,
				onlineCount: onlineCount,
				user: obj,
				socketId: socket.id
			});
			console.log('登录用户:', socket.id)
			getUsersList(function(data) {
				io.to(socket.id).emit('toself', {
					user: obj,
					socketId: socket.id,
					users: data
				});
			})

			console.log(obj.username + "登录成功");
		})

		socket.on('logout', function(obj) {
			//将退出用户在在线列表删除
			if (onlineUser.hasOwnProperty(socket.name)) {
				//退出用户信息
				var obj = {
					userid: socket.name,
					username: onlineUser[socket.name]
				};
				//删除
				delete onlineUser[socket.name];
				//在线人数-1
				onlineCount--;
				//广播消息
				io.emit('logout', {
					onlineCount: onlineCount,
					user: obj,
					socketId: socket.id
				});
				console.log(obj.username + "退出成功");
			}
		})

		//监听用户退出
		socket.on('disconnect', function(data) {
			console.log(11, data)

		})
		// 监听私聊
		socket.on('toOrderPerson', function(obj) {
			var tosocketid = obj.tosocketid;
			// 发送给指定的人
			io.to(tosocketid).emit('toYou', {
				userid: obj.userid,
				name: obj.name,
				msg: obj.msg,
				fromsocketid: obj.fromsocketid,
				tosocketid: tosocketid
			});
		});


		//监听用户发布聊天内容
		socket.on('message', function(obj) {
			//向所有客户端广播发布的消息
			obj.id = socket.name;
			console.log(obj)
			io.emit('message', obj);

			// console.log(obj.username + '说：' + obj.content);
		});
	})

	router.Io = IO = io;
}
// router.Io = IO;
router.post('/test', (req, res, next) => {
	var aa = req.body.aa;
	// console.log(aa)
	res.json({
		status: 200,
		msg: '成功'
	})
	// console.log(IO)
});



module.exports = router;
