var express = require('express');
var bodyParser = require('body-parser');
var user = require('./route/user');
var chat = require('./route/chat');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static("public"));

//设置跨域访问
app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", ' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
// app.use(bodyParser.urlencoded({
// 	extended: false
// }));
app.use(bodyParser.json());

app.use('/user', user);
chat.io(io);

app.use('/chat', chat);


http.listen(8800, function() {
	console.log('http://127.0.0.1:8800');
});
