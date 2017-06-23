var User = require('../models/user');
var DHT22 = require('../models/dht22');
var Higrometer = require('../models/higrometer');
var Electricity = require('../models/electricity');
var SystemInfo = require('../models/systeminfo');
var Event = require('../models/event');
var SerialMonitor = require('./serialmonitor');
var Realtime = require('./realtime');
var AverageDHT22 = require('../models/averagedht22');
var Utils = require('./utils');
var Watering = require('../models/watering');

sendUsers = function (socket) {
	User.find({}, function (err, users) {
		if (err) {
			log.error('Error getting all users: ' + err);
		}
		else {
			socket.emit('users', users);
		}
	});
};

sendLastDayDht22Data = function (socket) {
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	DHT22.find({
		date: {
			$gte: yesterday
		}
	}, function (err, dht22data) {
		if (err) {
			log.err('Error getting all dht22 data: ' + err)
		}
		else {
			socket.emit('data-dht22-24h', dht22data);
		}
	});
};

sendLastDayHigrometersData = function (socket) {
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	Higrometer.find({
		date: {
			$gte: yesterday
		}
	}, function (err, higrometersData) {
		if (err) {
			log.err('Error getting all higrometers data: ' + err)
		}
		else {
			socket.emit('data-higrometers-24h', higrometersData);
		}
	});
};

sendLastDayElectricityData =  function (socket) {
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	Electricity.find({
		date: {
			$gte: yesterday
		}
	}, function (err, electricityData) {
		if (err) {
			log.err('Error getting all electricity data: ' + err)
		}
		else {
			socket.emit('data-electricity-24h', electricityData);
		}
	});
};

sendLastDaySystemInfoData = function (socket) {
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	SystemInfo.find({
		date: {
			$gte: yesterday
		}
	}, function (err, systemInfoData) {
		if (err) {
			log.err('Error getting all system info data: ' + err)
		}
		else {
			socket.emit('data-systeminfo-24h', systemInfoData);
		}
	});
};

sendDht22AveragesCurrentWeek = function (socket) {
	AverageDHT22.find({
		date: {
			$gte: Utils.getDateByNdays(-8),
			$lt: Utils.getToday(),
		}
	}, function (err, averages) {
		if (err) {
			log.error('Error getting dht22 averages: ' + err);
		}
		else {
			socket.emit('data-averages-dht22', averages);
		}
	});
};

sendLastNevents = function (socket, n) {
	Event.find()
		.limit(n)
		.sort({
			date: -1
		}).exec( function (err, events) {
			if (err) {
				log.error('Error getting last ' + n + ' events: ' + err);
			}
			else {
				socket.emit('data-events', events);
			}
		});
};

sendLastWaterings = function (socket, n) {
	Watering.find()
		.limit(n)
		.sort({
			startdate: -1
		}).exec( function (err, events) {
			if (err) {
				log.error('Error getting last ' + n + ' events: ' + err);
			}
			else {
				socket.emit('data-waterings', events);
			}
		});
};

function Socket(io) {
	this.io = io;
	this.sockets = {};
	this.usm = null;
	this.rt = new Realtime(this.io);
	this.usm = new SerialMonitor(this.rt);
	this.usm.connect();

	var _this = this;

	io.on('connection', function(socket) {

		// New socket opened
		_this.sockets[socket.id] = null;

		// User logged in app, updating socketid attribute of user
		socket.on('userid', function(userid) {
			User.findById(userid, function(err, user) {
				if (err) {
					log.error('Error retriving user ' + data._id + ': ' + err);
				}
				else {
					user.status = 'online';
					user.socketid = socket.id;
					user.save(function (errorUpdate, updatedUser) {
						if (errorUpdate) {
							log.info('Error updating socket id of user ' + user._id + ': ' + err);
						}
						else {
							_this.sockets[socket.id] = updatedUser._id;
							log.info('Websocket: ' + Object.keys(_this.sockets).length + ' users online');
							_this.io.emit('user-online', updatedUser);
							// Send all users of application
							sendUsers(socket);
							// Send last day dht22 data
							sendLastDayDht22Data(socket);
							// Send last day higrometers data
							sendLastDayHigrometersData(socket);
							// Send last day electricity data
							sendLastDayElectricityData(socket);
							// Send last system info data
							sendLastDaySystemInfoData(socket);
							// Send average last 7 days
							sendDht22AveragesCurrentWeek(socket);
							// Send last 20 events
							sendLastNevents(socket, 20);
							// Send last 10 watering
							sendLastWaterings(socket, 10);
							// Send current status of signals
							socket.emit('signals', _this.rt.getSignals());
							// Send current data of higrometers
							socket.emit('higrometers', _this.rt.getHigrometers());
							// Send current data of dht22
							socket.emit('dht22', _this.rt.getDht22());
							// Send current status of watering
							socket.emit('watering', _this.rt.getWatering());
							// Send current status of process change times
							socket.emit('change-times', _this.rt.getChangingTimes());
							// Send current status of timers
							socket.emit('times', _this.rt.getTimes());
							// Send current system info
							socket.emit('systeminfo', _this.rt.getSystemInfo());
						}
					});
				}
			});
		});

		// Water order
		socket.on('water', function(data) {
			log.info('Sending order "water" to arduino');
			_this.usm.water();
		});

		// Times order
		socket.on('change-times', function(data) {
			log.info('Sending order "change-times" to arduino');
			_this.usm.times(data.data);
		});

		// Socket disconnected
		socket.on('disconnect', function() {
			delete _this.sockets[socket.id];
			User.findOne({socketid: socket.id}, function(err, user) {
				if (err) {
					log.info('Error getting user of socketid ' + socket.id + ': ' + err);
				}
				else {
					if (user != null) {
						user.status = 'offline';
						user.socketid = null;
						user.lastlogout = new Date();
						user.save(function (errorUpdate, updatedUser) {
							if (errorUpdate) {
								log.error('Error updating user with socketid ' + socket.id + ': ' + errorUpdate);
							}
							else {
								log.info('Websocket: ' + Object.keys(_this.sockets).length + ' users online');
								// User disconnected to websocket
								_this.io.emit('user-disconnected', updatedUser);
							}
						});
					}
					else {
						log.info('Trying to disconnect null user of websocket');
					}
				}
			});
		});

		/*
		socket.on('led', function(enabled) {
			led.val(enabled ? udoo.VALUES.HIGH : udoo.VALUES.LOW);
		});
		*/
	});

}

Socket.prototype = {
	close: function () {
		if (this.usm != null)
			this.usm.disconnect();
		this.io.emit('force-disconnect');
		log.info('Websocket closed');
	}
}


module.exports = Socket;