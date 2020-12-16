var registerpanel = {
	init: function() {
		this.getUserId();
	},
	getUserId: function() {
		var that = this;
		$.ajax({
			url: host + '/user/getid',
			success: function(data) {
				var userid = data.userid;
				console.log(data)
				that.getHtml(userid);

			}
		})
	},
	getHtml: function(userid) {
		var that = this;
		$.ajax({
			url: './render/registerpanel/registerpanel.html',
			success: function(data) {
				console.log(data)
				$('#register-panel').html(data);
				that.inputUserId(userid);
				that.move();
				that.listenClick();
			}
		})
	},
	inputUserId: function(id) {
		$('#register.register-box .user-info .row .input #userid').val(id);
	},
	listenClick: function() {
		$('#register .bts .bt-col').on('click', '#backbt', function() {
			$('#login-panel').show();
			$('#register.register-box').remove();
		});
		$('#register .bts .bt-col').on('click', '#registerbt', function() {
			
		});
	},
	move: function() {
		moveDom($('#register .zhanwei.header')[0], $('#register')[0]);
	}
}
