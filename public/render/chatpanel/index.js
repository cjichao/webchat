var chatpanel = {
	isShow: false,
	init: function() {
		this.getTemplate();
	},
	getTemplate: function() {
		var _this = this;
		$.ajax({
			url: './render/chatpanel/chatpanel.html',
			success: function(data) {
				$('#chat-panel').html(data);
				_this.choiceItem();
				_this.closeItem();
				_this.sendmsg();
				_this.closeWindow();
				_this.enterKeySend();
			}
		})
	},
	// 拖拽
	move: function() {
		moveDom($('.title')[0], $('#private-chat')[0]);
	},
	// 左侧聊天框会话列表
	renderList: function(obj) {
		var ul = $("#private-chat .choiceUserList .choiceUserList-ul");
		ul.find('.one-user').removeClass('choice');
		var li = $('<li></li>');
		var one_user = $('<div class="one-user" data-userid="' + obj.userId + '"></div>');
		one_user.addClass('choice');
		var headImg = $("<div class='image'><img class='headerImg' src='" + obj.headImg + "'></div>");
		var username = $("<div class='username'>" + obj.username + "</div>");
		var close = $("<div class='close'><span class='iconfont iconfont-size32 icon-guanbi'></span></div>");
		one_user.append(headImg).append(username).append(close);
		li.append(one_user);
		ul.append(li);
	},
	choiceItem: function() {
		var _this = this;
		$("#private-chat .choiceUserList .choiceUserList-ul").on('click', '.one-user', function() {
			$('.one-user').removeClass('choice');
			var $this = $(this);
			$this.addClass('choice');
			var li = $this.parent();
			var index = li.index();
			currectObj = chatList[index];
			_this.currect_chat_object();
		});
	},
	// 关闭左侧好友单项
	closeItem: function() {
		var that = this;
		$("#private-chat .choiceUserList .choiceUserList-ul").on('click', '.close', function(e) {
			e.stopPropagation();
			var lis = $("#private-chat .choiceUserList .choiceUserList-ul li");
			var lis_len = lis.length;
			// console.log(lis)
			var $this = $(this);
			var one_user = $this.parent();
			var userId = one_user.attr('data-userid');
			console.log(userId)
			$('#' + userId).attr('data-ischoice', 'false');
			var li = one_user.parent();
			var index = li.index();
			chatList.splice(index, 1);
			if (one_user.hasClass('choice')) {
				var prev = li.prev();
				if (prev.length == 1) {
					var child = prev.children(".one-user");
					currectObj = chatList[index - 1];
				} else {
					var next = li.next();
					var child = next.children(".one-user");
					currectObj = chatList[index];
				}
				child.addClass('choice');
				that.currect_chat_object();
			}
			if (lis_len == 2) {
				for (var i = 0; i < 2; i++) {
					var $li = $(lis[i]);
					var id = $li.children('.one-user').attr('data-userid');
					$('#' + id).attr('data-ischoice', 'false');
					$li.remove();
				}
				that.move();
			} else {
				li.remove();
			}
		});
	},
	// 主聊天对象
	currect_chat_object: function() {
		$('.chat-main .title .head-portrait img').attr('src', currectObj.headImg);
		$('.chat-main .title .username .name').text(currectObj.username);
		if (currectObj.isOnline) {
			$('.chat-main .title .username .isonline').text('在线');
		} else {
			$('.chat-main .title .username .isonline').text('离线');
		}
	},
	addToList: function(obj) {
		if (currectObj !== null && chatList.length == 0) {
			chatList.push(currectObj);
		}
		chatList.push(obj);
		if (chatList.length == 1) {
			this.move();
		} else if (chatList.length == 2) {
			this.renderList(chatList[0]);
			this.renderList(chatList[1]);
			this.move();
		} else {
			this.renderList(obj);
		}
		currectObj = obj;
		this.currect_chat_object();

	},
	// 发送消息
	sendmsg: function() {
		var that = this;
		$('.input-box .input-footer .bts-send .bt.send').click(function() {
			var textarea = $('.input-box .input-textarea textarea');
			var msg = textarea.val().trim();
			if (msg == '') {
				return;
			}
			console.log(msg);
			// currectObj.socketid
			var tosocketid;
			for (var i = 0, len = friend_list_no_group.length; i < len; i++) {
				var item = friend_list_no_group[i];
				if (currectObj.userid == item.userid) {
					if (item.socketid) {
						tosocketid = item.socketid;
					} else {
						console.log('不在线')
					}
				}
			}
			console.log(currectObj, tosocketid)
			socket.emit('toOrderPerson', {
				userid: selfInfo.userid,
				name: selfInfo.username,
				msg: msg,
				tosocketid: tosocketid,
				fromsocket: selfInfo.socketid
			});
			that.record('self', msg, './img/header.png');
			textarea.val('')
		})
	},
	// 关闭窗口
	closeWindow: function() {
		var that = this;
		$('.chat-main .title .operate .bt.close').click(function() {
			$('#private-chat').css('display', 'none');
			$('#private-chat').attr('data-show', 'false');
		})

		$('.input-box .input-footer .bts-send .bt.close').click(function() {
			$('#private-chat').css('display', 'none');
			$('#private-chat').attr('data-show', 'false');
		})
	},
	// 聊天记录 ,type:friend,self
	record: function(type, msg, headimgsrc) {
		var content = $('#private-chat .chat-main .content');
		var row = $('<div class="row"></div>');
		var news = $('<div class="news ' + type + '"></div>');
		var headerimg = $('<div class="headerimg"><img src="' + headimgsrc + '"></div>');
		var message = $('<div class="message">' + msg + '</div>');
		news.append(headerimg).append(message);
		row.append(news);
		content.append(row);
		content.scrollTop(content[0].scrollHeight);
		console.log(content[0].scrollHeight)
	},
	// 回车发送消息
	enterKeySend: function() {
		var that = this;
		document.onkeydown = function(e) {
			var key = e.keyCode;
			var textarea = $('.input-box .input-textarea textarea');
			switch (key) {
				case 13:
					e.preventDefault();
					if (textarea[0] === document.activeElement) {
						var msg = textarea.val().trim();
						if (msg == '') {
							return;
						}
						console.log(msg);
						// currectObj.socketid
						var tosocketid;
						for (var i = 0, len = friend_list_no_group.length; i < len; i++) {
							var item = friend_list_no_group[i];
							if (currectObj.userid == item.userid) {
								if (item.socketid) {
									tosocketid = item.socketid;
								} else {
									console.log('不在线')
								}
							}
						}
						console.log(currectObj, tosocketid)
						socket.emit('toOrderPerson', {
							userid: selfInfo.userid,
							name: selfInfo.username,
							msg: msg,
							tosocketid: tosocketid,
							fromsocket: selfInfo.socketid
						});
						that.record('self', msg, './img/header.png');
						textarea.val('')
					} else {
						console.log('没聚焦')
					}
					return;
				default:
					return;
			}
		}
	}

}

// $(function() {
// 	chatpanel.init()
// 	setTimeout(function() {
// 		$('#private-chat').show();
// 	}, 300)

// });
