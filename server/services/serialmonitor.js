var DHT22 = require('../models/dht22');
var Watering = require('../models/watering');
var Higrometer = require('../models/higrometer')
var Event = require('../models/event')
var mailer = require('../services/mailer');
var User = require('../models/user');
var Electricity = require('../models/electricity');

var Events = {
	HIGROMETERS: "higrometers",
	DHT22: "dht22",
	EVENT: "event",
	SIGNALS: "signals",
	WATERING: "watering",
	TIMES: "times",
	ELECTRICITY: "electricity",
};

var WateringEvents = {
	INICIO_RIEGO: 1,
	FIN_RIEGO: 2,
	LLENANDO_DEPOSITO: 3,
	DEPOSITO_LLENO: 4
};

isNumber = function(value) {
	return !isNaN(value);
};

sendMailToUsers = function (subject, body) {
	User.find({}, function (err, users) {
		if (err) {
			log.error('Error geting all users to send email "' + subject + '"');
		}
		else {
			var receivers = [];
			for (var i = 0; i < users.length; i++) {
				receivers.push(users[i].email);
			}
			if (receivers.length > 0) {
				var today = new Date();
				if (body != null)
					body += today.toLocaleString();
				else
					body = today.toLocaleString();
				mailer.sendEmail(receivers, subject, body);
			}
		}
	});
};

isJsonString = function (str) {
	try {
        var o = JSON.parse(str);
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (err) {}
    return false;
}

function SerialMonitor(realtime) {
	this.realtime = realtime;
	this.port = null;
	this.countHigrometer = 0;
	this.countDHT22 = 0;
	this.countElectricity = 0;
	this.timeSignals = {
		lowLevelBomb: 0,
	};
	this.watering = null;
}

SerialMonitor.prototype = {
	initWatering: function() {
		this.watering = null;
	},
	getRealTime: function() {
		return this.realtime;
	},
	getCountHigrometer: function() {
		return this.countHigrometer;
	},
	getCountDHT22: function() {
		return this.countDHT22;
	},
	getCountElectricity: function() {
		return this.countElectricity;
	},
	incrementCountHigrometer: function() {
		this.countHigrometer++;
	},
	incrementCountDHT22: function() {
		this.countDHT22++;
	},
	incrementCountElectricity: function() {
		this.countElectricity++;
	},
	initializeCountHigrometer: function() {
		this.countHigrometer = 0;
	},
	initializeCountDHT22: function() {
		this.countDHT22 = 0;
	},
	initializeCountElectricity: function() {
		this.countElectricity = 0;
	},
	disconnect: function() {
		this.port.close(function() {
			log.info('Serial Monitor disconnected');
		});
	},
	connect: function() {
		var _this = this;
		var SerialPort = require('serialport');
		this.port = new SerialPort(process.env.SERIAL_PORT, {
			baudRate: 115200,
			parser: SerialPort.parsers.readline("\r\n")
		});
		this.port.on('open', function() {
			log.info('Connected successfully to serial port');
		});
		this.port.on('error', function(err) {
			if (err)
				log.error('Serial port error: ' + err.message);
		});
		this.port.on('data', function(rawData) {
			var serialData = isJsonString(rawData)
			if (serialData !== false) {
				if (serialData.hasOwnProperty('status') && serialData.status == 'success' && serialData.hasOwnProperty('type')) {
					if (serialData.type == Events.HIGROMETERS) {
						if (serialData.hasOwnProperty('data') && serialData.data.hasOwnProperty('higrometer1') && serialData.data.hasOwnProperty('higrometer2') && serialData.data.hasOwnProperty('higrometer3') && serialData.data.hasOwnProperty('higrometer4')) {
							var newHigrometerData = new Higrometer({
								higrometer1: serialData.data.higrometer1.toFixed(2),
								higrometer2: serialData.data.higrometer2.toFixed(2),
								higrometer3: serialData.data.higrometer3.toFixed(2),
								higrometer4: serialData.data.higrometer4.toFixed(2),
							});
							// Cada captura del sensor es cada 3 segundos
							// en 1 minuto tenemos 20 capturas
							// queremos guardar datos cada 30 segundos
							if (_this.getCountHigrometer() == 10) {
								newHigrometerData.save(function(errHigro, newHigro) {
									if (errHigro)
										log.error('Error inserting higrometer data: ' + errHigro);
									else {
										log.info('Higro1: %s%, Higro2: %s%, Higro3: %s%, Higro4: %s%', newHigro.higrometer1, newHigro.higrometer2, newHigro.higrometer3, newHigro.higrometer4);
										_this.initializeCountHigrometer();
									}
								});
							}
							_this.incrementCountHigrometer();
							_this.getRealTime().setHigrometers(newHigrometerData);
						}
						else {
							log.error('Missing data on higrometer: ' + JSON.stringify(serialData));
						}
					}
					else if (serialData.type == Events.DHT22) {
						if (serialData.hasOwnProperty('data') && serialData.data.hasOwnProperty('temperature') && serialData.data.hasOwnProperty('humidity') && serialData.data.temperature > 0 && serialData.data.humidity > 0) {
							var dht22 = new DHT22({
								temperature: serialData.data.temperature.toFixed(2),
								humidity: serialData.data.humidity.toFixed(2),
							});
							// Cada captura del sensor es cada 3 segundos
							// en 1 minuto tenemos 20 capturas
							// queremos guardar datos cada 30 segundos
							if (_this.getCountDHT22() == 10) {
								dht22.save(function(errdht22, newdht22) {
									if (errdht22)
										log.error('Error inserting new dht22 register: ' + errdht22)
									else {
										log.info('Temperature: %sºC, Humidity: %s%', newdht22.temperature, newdht22.humidity);
										_this.initializeCountDHT22();
									}
								});
							}
							_this.incrementCountDHT22();
							_this.getRealTime().setDht22(dht22);
						}
						else {
							log.error('Missing data on dht22: ' + JSON.stringify(serialData));
						}
					}
					else if (serialData.type == Events.ELECTRICITY) {
						if (serialData.hasOwnProperty('data') && serialData.data.hasOwnProperty('irms') && serialData.data.hasOwnProperty('power') && serialData.data.hasOwnProperty('watts')) {
							var electricity = new Electricity({
								irms: serialData.data.irms,
								power: serialData.data.power,
								watts: serialData.data.watts,
							});
							if (_this.getCountElectricity() == 20) {
								electricity.save(function(errorElectricity, newElectricity) {
									if (errorElectricity) {
										log.error('Error inserting new electricity register: ' + errorElectricity);
									}
									else {
										log.info('Electricity: %sA, %sP, %sW', newElectricity.irms, newElectricity.power, newElectricity.watts);
										_this.initializeCountElectricity();
									}
								});
							}
							_this.incrementCountElectricity();
							_this.getRealTime().setElectricity(electricity);
						}
						else {
							log.error('Missing data on sct-013-030: ' + JSON.stringify(serialData));
						}
					}
					else if (serialData.type == Events.EVENT) {
						if (serialData.hasOwnProperty('message')) {
							if (serialData.message == "INICIANDO_RIEGO") {
								sendMailToUsers("Arduino: Empezando a regar.");
							}
							else if (serialData.message == "RIEGO_FINALIZADO") {
								_this.getRealTime().setWatering(false);
								sendMailToUsers("Arduino: Riego finalizado.");
							}
							else if (serialData.message == "TIEMPOS_ACTUALIZADOS") {
								_this.getRealTime().setChangingTimes(false);
								var message = "Arduino: Cambio de tiempos de riego.\n";
								var times = _this.getRealTime().getTimes();
								var content = "";
								for (var key in times) {
									content += key + ": " + times[key] + " ms \n"
								}
								sendMailToUsers(message, content);
							}
							var event = new Event({
								message: serialData.message
							});
							event.save(function(errEvent, newEvent) {
								if (errEvent) {
									log.error('Error inserting new event: ' + errEvent);
								}
								else {
									log.info('Inserted new event: "' + newEvent.message + '"');
									_this.getRealTime().sendEvent(newEvent);
								}
							});
						}
						else {
							log.error('Missing message on event: ' + JSON.stringify(serialData));
						}
					}
					else if (serialData.type == Events.SIGNALS) {
						if (serialData.hasOwnProperty('data')) {
							for (var signalKey in serialData.data) {
								var active = serialData.data[signalKey] == 1 ? true : false;
								if (!active && signalKey == "lowLevelBomb") {
									var currentEpoch = (new Date).getTime();
									// Esperar 12h para enviar el siguiente email
									if (_this.timeSignals.lowLevelBomb == 0 || (currentEpoch - _this.timeSignals.lowLevelBomb >= 43200000)) {
										_this.timeSignals.lowLevelBomb = currentEpoch;
										sendMailToUsers("Arduino: Falta agua en el tanque.");
									}
								}
							}
							_this.getRealTime().setSignals(serialData.data);
						}
						else {
							log.error('Missing data on signals: ' + JSON.stringify(serialData));
						}
					}
					else if (serialData.type == Events.WATERING) {
						if (serialData.hasOwnProperty('code')) {
							switch (serialData.code) {
								case WateringEvents.INICIO_RIEGO:
									this.watering = new Watering();
									this.watering.startdate = new Date();
									break;
								case WateringEvents.FIN_RIEGO:
									this.watering.enddate = new Date();
									this.watering.save(function(err, newWatering) {
										if (err) {
											log.error('Error inserting new register of watering: ' + err);
										}
										else {
											log.info('Inserted new water:' + newWatering._id);
											_this.initWatering();
											_this.getRealTime().newWatering(newWatering);
										}
									});
									break;
								case WateringEvents.LLENANDO_DEPOSITO:
									break;
								case WateringEvents.DEPOSITO_LLENO:
									break;
							}
						}
						else {
							log.error('Missing code on watering: ' + JSON.stringify(serialData));
						}
					}
					else if (serialData.type == Events.TIMES) {
						if (serialData.hasOwnProperty('data')) {
							_this.getRealTime().setTimes(serialData.data);
						}
						else {
							log.error('Missing data on times: ' + JSON.stringify(serialData));
						}
					}
				}
				else if (serialData.hasOwnProperty('status') == "error") {
					log.info('Serial port error: ' + serialData.message);
				}
			}
		});
	},
	water: function() {
		var _this = this;
		var data = {
			action: "water"
		};
		this.port.write(JSON.stringify(data), function (err) {
			if (err) {
				log.error('Serial port error on send "water": ' + err)
			}
			else {
				log.info('Order water sent to arduino');
				_this.getRealTime().setWatering(true);
			}
		});
	},
	times: function(times) {
		var _this = this;
		var info = {
			action: 'change-times',
			data: times
		}
		this.port.write(JSON.stringify(info), function (err) {
			if (err) {
				log.error('Serial port error on send "times": ' + err)
			}
			else {
				log.info('Serial port: Order "change-times" sent to Arduino');
				_this.getRealTime().setChangingTimes(true);
			}
		});
	}
};

module.exports = SerialMonitor;