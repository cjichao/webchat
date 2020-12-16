var loginpanel = {
	init: function() {
		this.getTemplate();
	},
	getTemplate: function() {
		var _this = this;
		$.ajax({
			url: './render/loginpanel/loginpanel.html',
			success: function(data) {
				$('#login-panel').html(data);
				_this.move();
				_this.login();
				_this.register();
			}
		})
	},
	// 拖拽
	move: function() {
		moveDom($('#login .zhanwei.header')[0], $('#login')[0]);
	},
	login: function() {
		$('#login.login-box .bts .bt-col').on('click', '#loginbt', function() {

			var userid = $('#usernamein').val();
			var password = $('#passwordin').val();
			if (userid.trim() == '') {
				console.log('请输入账号');
				return;
			}
			if (password.trim() == '') {
				console.log('请输入密码');
				return;
			}
			// console.log(userid, password);
			$.ajax({
				type: 'post',
				url: host + '/user/login',
				data: {
					// userid: "00008888",
					// password: "1234567890",
					userid: userid,
					password: password
				},
				success: function(data) {
					if (data.status == 200) {
						var userdata = data.data;
						if (userdata.status == 200) {
							// console.log(userdata.msg);
							console.log(userdata.data);
							selfInfo = userdata.data;
							mainpanel.init();
							$('#login.login-box').hide();
							socket = io(iohost);
							socket.emit('login', selfInfo);
						} else if (userdata.status == 403 || userdata.status == 401) {
							console.log(userdata.msg);
						}
					}
				},
				error: function(err) {
					console.log(err)
				}
			})
		})
	},
	register: function() {
		$('#login.login-box .bts .bt-col').on('click', '#toregisterbt', function() {
			$('#login-panel').hide();
			registerpanel.init();
		})
	}
}

$(loginpanel.init());
