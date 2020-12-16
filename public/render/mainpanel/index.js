var mainpanel = {
	init: function() {
		this.getFriends();
	},
	getFriends: function() {
		var that = this;
		$.ajax({
			type: 'post',
			url: host + '/user/getfriends',
			data: {
				userid: selfInfo.userid
			},
			success: function(data) {
				// 获取好友列表
				// console.log(data)
				if (data.status == 200) {
					friend_list = data.data;
					console.log(friend_list)
					that.friendsNoGroup(friend_list);
					that.getTemplate();
				} else {
					alert('出错了')
				}
			},
			error: function(err) {
				console.log(err)
			}
		})
	},
	friendsNoGroup: function(list) {
		for (var i = 0, length = list.length; i < length; i++) {
			var obj = list[i];
			var list1 = obj.friends;
			for (var j = 0, len = list1.length; j < len; j++) {
				friend_list_no_group.push(list1[j]);
			}
		}
	},
	getTemplate: function() {
		var _this = this;
		$.ajax({
			url: './render/mainpanel/mainpanel.html',
			success: function(data) {
				$('#main-panel').html(data)

				_this.switch_tab();

				_this.setSelfInfo();
				_this.watch_online_hide();
				_this.renderFriendsList();
				_this.renderGroupsList();
				// _this.renderMessageList();
				_this.open_list();
				_this.clickItem();
				_this.logout();
				_this.move();
				_this.listenSocket();
				chatpanel.init();
				// 修改头像
				_this.updateHeadImg();
			}
		})
	},
	// 拖拽
	move: function() {
		moveDom($('.self')[0], $('#chat-box')[0]);
	},
	// 好友，群组，当前会话切换
	switch_tab: function() {
		$('.classify-tab .tabs').on('click', '.each-tab', function() {
			$('.each-tab').removeClass('active');
			var _this = $(this);
			_this.addClass('active');
			$('.group-list-item').removeClass('show');
			var id = _this.attr('data-id');
			$('#' + id).addClass('show');
		})
	},
	// 展开列表
	open_list: function() {
		$('.friends-list .group').on('click', '.group-name', function() {
			var _this = $(this);
			_this.next().toggle();
			var child = _this.children('.zhankai');
			if (child.hasClass('toright')) {
				child.removeClass('toright');
			} else {
				child.addClass('toright');
			}
		})
	},
	setSelfInfo: function() {
		$('.information .self .img img').attr('src', selfInfo.headImg);
		$('.information .self .name').text(selfInfo.username);
		var isOnline = selfInfo.isOnline;
		if (isOnline) {
			$('#online_radio').attr('checked', 'true');
		} else {
			$('#hide_radio').attr('checked', 'true');
		}
		this.switch_online_hide(selfInfo.isOnline);
		$('.information .personal-signature .remark').val(selfInfo.gxqm);
	},
	updateHeadImg: function() {
		var file = document.getElementById('file');
		var box = document.getElementById('imgbox');
		var type;
		file.onchange = function() {
			//获取图片名称
			var files = this.files;
			var img = files[0];
			var pettern = /^image/;
			if (!pettern.test(img.type)) {
				alert("图片格式不正确");
				return;
			}
			type = img.type.split('/')[1];
			var reader = new FileReader();
			reader.readAsDataURL(img); //异步读取文件内容，结果用data:url的字符串形式表示
			/*当读取操作成功完成时调用*/
			reader.onload = function(e) {
				var dom = createImgDom(this.result);
				box.appendChild(dom);
			}
		}

		function createImgDom(imgsrc) {
			var show = cDom('div');
			show.className = 'show';
			var img = cDom('img');
			img.className = 'up imgs';
			img.src = imgsrc;

			var close = cDom('div');
			close.className = 'close';
			close.addEventListener('click', function() {
				show.remove();
			});
			show.appendChild(img);
			show.appendChild(close);
			return show;
		}

		function cDom(labelname) {
			return document.createElement(labelname);
		}
		var btoff = document.getElementsByClassName('bt off')[0];
		var uploaddom = document.getElementById('uploaddom');
		btoff.addEventListener('click', function() {
			uploaddom.style.display = 'none';
		});
		var uploadImg = {
			init: function(options) {
				var width = options.width || '250px';
				uploaddom.style.width = width;
				var isInitShow = !!options.isInitShow;
				if (isInitShow) {
					this.show();
				}
			},
			show: function() {
				uploaddom.style.display = 'block';
			},
			up: function(callback) {
				var btup = document.getElementsByClassName('bt up')[0];
				btup.addEventListener('click', function() {
					var imgs = document.getElementsByClassName('up imgs');
					var datalist = [];
					for (var i = 0; i < imgs.length; i++) {
						datalist.push(imgs[i].src);
					}
					callback && callback(datalist);
				});
			}
		}
		uploadImg.init({
			width: '250px',
			isInitShow: false
		});
		uploadImg.up(function(data) {
			console.log(data)
		});
		$('.information .self .img img').click(function() {
			uploadImg.show();
		});
	},
	// 监听在线和隐身切换
	watch_online_hide: function() {
		var _this = this;
		$("input:radio[name='isonline']").on('click', function() {
			var val = $(this).val();
			if (val === 'online') {
				selfInfo.isOnline = true;
			} else if (val === 'hide') {
				selfInfo.isOnline = false;
			}
			_this.switch_online_hide(selfInfo.isOnline);
		})
	},
	// 在线和隐身切换
	switch_online_hide: function(isOnline) {
		var onlineDom = $('.information .self .online_status #small-bt-choice-online');
		if (isOnline) {
			onlineDom.addClass('online');
			onlineDom.removeClass('hide');
		} else {
			onlineDom.addClass('hide');
			onlineDom.removeClass('online');
		}
	},
	renderFriendsList: function() {
		// 好友列表
		var friendGroup = $('.friends-list #friend-group');
		var len = friend_list.length;
		for (var i = 0; i < len; i++) {
			var obj = friend_list[i];
			var group = $('<div class="group"></div>');
			var groupName = $('<div class="group-name">' +
				'<span class="iconfont iconfont-size20 icon-zhankai zhankai toright"></span>' +
				'<span class="title-name">' + obj.groupName + '</span></div>');
			group.append(groupName);
			var friends = obj.friends;
			var length = friends.length;
			var groupList = $('<div class="group-list"></div>');
			var ul = $('<ul></ul>');
			groupList.append(ul);
			this.renderList(ul, friends);
			group.append(groupName).append(groupList);
			friendGroup.append(group);
		}
	},
	// 群列表
	renderGroupsList: function() {
		var ul = $('.friends-list #group-group .groups ul');
		this.renderList(ul, groupList);
	},
	// 会话列表
	renderMessageList: function() {
		// var ul = $('.friends-list #message-group .groups ul');
		// this.renderList(ul, messageList);
		// ul.append(li);
	},
	// 群和会话
	renderList: function(box, data) {
		var ul_message_group = $('.friends-list #message-group .groups ul');
		var len = data.length;
		for (var i = 0; i < len; i++) {
			var obj = data[i];
			var li = $('<li></li>');
			var listItem = $('<div class="list-item" id="' + obj.userid + '"></div>');
			listItem.attr('data-userid', obj.userid);
			listItem.attr('data-name', obj.username);
			listItem.attr('data-headImg', obj.headImg);
			listItem.attr('data-gxqm', obj.gxqm);
			listItem.attr('data-isonline', obj.isOnline);
			listItem.attr('data-haschat', obj.hasChat);
			li.append(listItem);
			var headImg = $("<div class='headimg'><img src='" + obj.headImg + "'></div>");
			var simpleInfo = $("<div class='simple-info'>" +
				"<div class='name'>" + obj.username + "</div></div>");
			if (obj.hasOwnProperty('gxqm')) {
				simpleInfo.append("<div class='gxqm'>" + obj.gxqm + "</div>");
			}

			listItem.append(headImg).append(simpleInfo);

			var cloneLi = li.clone();
			var child = cloneLi.children('.list-item');
			var id = 'clone' + child.attr('id');
			child.attr('id', id);
			if (obj.hasChat) {
				ul_message_group.append(cloneLi);
			}
			messageList.push({
				li: li[0],
				clone: cloneLi[0]
			});
			obj.li = li;

			box.append(li);
		}
	},
	// 判断聊天框显示了没有
	judgeChatFrame: function() {
		var show = $('#private-chat').attr('data-show');
		if (show === 'false' || !show) {
			$('#private-chat').css('display', 'flex');
			$('#private-chat').attr('data-show', 'true');
		}
	},
	clickItem: function() {
		var that = this;
		var ul_message_group = $('.friends-list #message-group .groups ul');
		$('.group-list-item').on('click', '.list-item', function() {
			that.judgeChatFrame();
			var $this = $(this);
			// 判断在不在当前会话，不在就添加到当前会话
			var hasChat = $this.attr('data-haschat');
			var this_index = that.which($(this).parent()[0], messageList);
			if (hasChat === 'false') {
				$this.attr('data-haschat', true);
				var clone = messageList[this_index].clone;
				$(clone).children('.list-item').attr('data-haschat', true);
				ul_message_group.prepend(clone);
			}
			var isChoice = $this.attr('data-isChoice');
			var obj = {
				userid: $this.attr('data-userid'),
				username: $this.attr('data-name'),
				headImg: $this.attr('data-headImg'),
				isOnline: $this.attr('data-isonline'),
			}
			console.log(obj)
			var index = that.whichLeftChoiceDom(obj, chatList);
			if (index > -1) {
				currectObj = obj;
				chatpanel.currect_chat_object();
				$('.one-user').removeClass('choice');
				$('.one-user').eq(index).addClass('choice');
			} else if (isChoice !== 'true' && index == -1) {
				$this.attr('data-ischoice', true);
				chatpanel.addToList(obj);
			}
		});
		// 当前会话列表右击操作，用来移除
		$('#message-group.group-list-item').on('contextmenu', '.list-item', function(e) {
			e.preventDefault();
			var $this = $(this);

			var $li = $this.parent();
			var index = that.which($li[0], messageList);
			console.log(index, messageList[index].li)
			$(messageList[index].li).children('.list-item').attr('data-haschat', false);
			$(messageList[index].clone).children('.list-item').attr('data-haschat', false);
			$li.remove();
		});
	},
	// 寻找在当前会话的索引
	which: function(obj, list) {
		for (var i = 0, len = list.length; i < len; i++) {
			var item = list[i];
			for (var key in item) {
				if (item[key] === obj) {
					return i;
				}
			}
		}
	},
	// 寻找在左侧聊天框的索引
	whichLeftChoiceDom: function(obj, list) {
		for (var i = 0, len = list.length; i < len; i++) {
			var item = list[i];
			var is = true;
			for (var key in obj) {
				if (obj[key] == item[key]) {
					is = true;
				} else {
					is = false;
					break;
				}
			}
			if (is) {
				return i;
			}
		}
		return -1;
	},
	logout: function() {
		$('.information .self .close').click(function() {
			$.ajax({
				type: 'post',
				url: host + '/user/logout',
				data: {
					userid: selfInfo.userid
				},
				success: function(data) {
					if (data.status == 200) {
						var info = data.data;
						if (info.status == 200) {
							// 成功
							console.log(info.msg);
							$('#chat-box.chat-user-box').remove();
							$('#login.login-box').show();
							socket.emit('logout', selfInfo);
						} else if (info.status == 401) {
							// 失败
							console.log(info.msg);
						}
					} else {
						console.log(data.msg);
					}

				},
				error: function(err) {

				}
			})
			console.log('退出')
		})
	},
	// 设置当前聊天好友
	setCurrectFriend: function(friend, index) {
		currectObj = friend;
		chatpanel.currect_chat_object();
		$('.one-user').removeClass('choice');
		$('.one-user').eq(index).addClass('choice');
	},
	listenSocket: function() {
		var that = this;
		// 监听上线的人
		socket.on('login', function(obj) {
			console.log('上线了', obj)
			var res = that.isFriend(obj.user, obj.socketId);
			if (res) {
				console.log('是自己好友')
			} else {
				console.log('不是自己好友')
			}
		});
		// 监听谁私聊自己了
		socket.on('toYou', function(obj) {
			that.judgeChatFrame();
			var who = obj.userid; // 发送人的userid
			var list = friend_list_no_group;
			for (var i = 0; i < list.length; i++) {
				var friend = list[i];
				if (who == friend.userid) {
					var child = friend.li.children(":first");
					var isChoice = child.attr('data-isChoice');
					var index = that.whichLeftChoiceDom(friend, chatList);
					if (index > -1) {
						currectObj = friend;
						chatpanel.currect_chat_object();
						$('.one-user').removeClass('choice');
						$('.one-user').eq(index).addClass('choice');
					} else if (isChoice !== 'true' && index == -1) {
						child.attr('data-ischoice', true);
						chatpanel.addToList(friend);
					}
					// currectObj = friend;
					// chatpanel.currect_chat_object();
					// friend.li.attr('data-ischoice', true);
					// chatpanel.addToList(friend);
				}
			}
			chatpanel.record('friend', obj.msg, currectObj.headImg); // './img/header.png'
			console.log(obj.name + '说：' + obj.msg);
		});
		// 监听自己上线了
		socket.on('toself', function(obj) {
			// console.log('自己上线了', obj)
			selfInfo.socketid = obj.socketId;
			var users = obj.users;
			var list = friend_list_no_group;
			for (var i = 0; i < users.length; i++) {
				var item = users[i];
				for (var j = 0; j < list.length; j++) {
					var user = list[j];
					if (item.userid === user.userid) {
						if (item.socketid) {
							user.socketid = item.socketid;
						}
					}
				}
			}
			console.log(users)
		});
	},
	// 判断是不是自己好友
	isFriend: function(user, socketid) {
		var len = friend_list_no_group.length;
		for (var i = 0; i < len; i++) {
			if (user.userid === friend_list_no_group[i].userid) {
				friend_list_no_group[i].socketid = socketid;
				return true;
			}
		}
		return false;
	}
}

// $(mainpanel.init());
