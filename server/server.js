require('./process.env');
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Socket = require('./services/socket');
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
var userRoutes = require('./controllers/users');
var authRoutes = require('./controllers/auth');
var udoo = require('./services/udoo');
var Crontab = require('./services/crontab');
var Log = require('log')
var fs = require('fs');
var morgan = require('morgan')
var rfs = require('rotating-file-stream')
var FCM = require('./services/fcm');
var favicon = require('serve-favicon');

setInterval(function() {
	var myFCM = new FCM();
	myFCM.sendMessage();
}, 100000);

require('crashreporter').configure({
	mailEnabled: true,
	mailTransportName: 'SMTP',
	mailTransportConfig: {
		service: 'Gmail',
		auth: {
			user: process.env.MAIL_USER,
		    pass: process.env.MAIL_PASSWORD
		}
	},
	mailSubject: 'Crashreporter',
	mailFrom: 'Crashreporter ' + process.env.MAIL_USER,
	mailTo: process.env.CRASH_REPORT_EMAIL
});

var logDirectory = path.join(__dirname, 'log');
if (!fs.existsSync(logDirectory)) {
	console.log('Log directory "' + logDirectory + '" does not exists.');
	fs.mkdirSync(logDirectory);
	if (!fs.existsSync(logDirectory)) {
		console.log('Log directory "' + logDirectory + '" could not be created');
		process.exit(-1);
	}
}

var rotateConfig = {
  path: logDirectory,
  size:     '10M',
  interval: '1d',
  compress: 'gzip'
};
var infoLogStream = rfs('info.log', rotateConfig);
log = new Log('debug', infoLogStream);

var accessLogStream = rfs('access.log', rotateConfig);

var socket = new Socket(io);
var crontab = new Crontab();
// MONGOOSE
mongoose.connect(process.env.MONGO_URL, function(error) {
	if (error) {
		log.error("Connecting to MongoDB: " + error);
		process.exit(-2);
	}
	else {
		log.info("Connected successfully to MongoDB. Url: " + process.env.MONGO_URL);
	}
});

http.on('error', function(err) {
	log.error('Error on server http: ' + err);
});

process.on('SIGINT', function() {
	log.critical('CTRL+C caught. Stopping server...');
	socket.close();
	mongoose.connection.close();
	process.exit();
});

// BODY-PARSER
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// STATIC FILES
app.use(express.static(__dirname + '/../client'));
app.use(express.static(__dirname + '/../client/assets'));
app.use(express.static(__dirname + '/../client/views'));
app.use(express.static(__dirname + '/../node_modules'));
app.use(favicon(__dirname + '/../client/assets/img/favicon.ico'));
app.use(morgan(':date[iso] - Remote address: :remote-addr - Remote user: :remote-user - Method: :method - Url: :url - Http version: HTTP/:http-version - Http code status: :status - Response time: :response-time ms', {stream: accessLogStream}))

// ROUTES
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/views/index.html');
});

// UDOO
//var led = new udoo.GPIO(16).out();

http.listen(3000, function() {
	log.info('Server is listening on port 3000');
});