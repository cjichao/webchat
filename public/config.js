var hostIP = '127.0.0.1';
// var hostIP = '192.168.80.85';
var hostPort = '8800';
var host = 'http://' + hostIP + ':' + hostPort;
var iohost = 'ws://' + hostIP + ':' + hostPort;

// var socket = io();
var socket;

var selfInfo = null;

// 好友列表
var friend_list = [];
// 好友列表没有群的，把所有好友提出来
var friend_list_no_group = [];

var groupList = [{
	userid: '11111',
	name: '前端群',
	headImg: './img/header.png',
	isOnline: true,
	hasChat: !false // 存在当前会话
}, {
	userid: '11112',
	name: '官方群',
	headImg: './img/header.png',
	isOnline: true,
	hasChat: !true // 存在当前会话
}, {
	userid: '11113',
	name: '学习群',
	headImg: './img/header.png',
	isOnline: true,
	hasChat: !false // 存在当前会话
}, ];

var messageList = [];
// 当前聊天对象
var currectObj = null;
// {
// name: '小李子',
// headImg: './img/header.png',
// isOnline: true,
// isChoice: true,
// socketid: '21313213'
// }

// 聊天框左侧列表
var chatList = [
	// {
	// 	name: '小李子',
	// 	headImg: './img/header.png',
	// 	isOnline: true,
	// }
];
