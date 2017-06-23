var exec = require('child_process').exec;
var SystemInfo = require('../models/systeminfo');

function Realtime (io) {
	var _this = this;
	this.io = io;
	this.watering = false;
	this.changingTimes = false;
	this.signals = {
		ELECTROVALVULA_DEPOSITO_1: false,
		ELECTROVALVULA_DEPOSITO_2: false,
		ELECTROVALVULA_DEPOSITO_3: false,
		ELECTROVALVULA_DEPOSITO_4: false,
		ELECTROVALVULA_BOMBA_AGUA: false,
		NIVEL_BAJO_DEPOSITO_GENERAL: false,
	};
	this.higrometers = {
		higrometer1: 0,
		higrometer2: 0,
		higrometer3: 0,
		higrometer4: 0,
	};
	this.dht22 = {
		temperature: 0,
		humidity: 0,
	};
	this.times = {
		solenoid1: 0,
		solenoid2: 0,
		solenoid3: 0,
		solenoid4: 0,
		bomb: 0,
	};
	this.electricity = {
		irms: 0,
		power: 0,
		watts: 0,
	};
	this.dataSystemInfo = {
		temperature: 0,
		avg: 0,
		avg5: 0,
		avg15: 0
	};
	this.timerSystem = setInterval(function() {
		exec(process.env['TEMP_COMMAND'], function(error, stdout, stderr) {
			if (error) {
				log.error('Error executing "' + process.env['TEMP_COMMAND'] + '": ' + error);
				log.error('Salida de error ejecutando "TEMP_COMMAND": ' + stderr);
			}
			else {
				var temp = stdout.replace('\n', '').split('=')[1].replace('\'C', '');
		  		exec(process.env['LOAD_AVERAGE_COMMAND'], function(error, stdout, stderr) {
					if (error) {
						log.error('Error executing "' + process.env['LOAD_AVERAGE_COMMAND'] + '": ' + error);
						log.error('Salida de error ejecutando "LOAD_AVERAGE_COMMAND": ' + stderr);
					}
					else {
						var loadAvgs = stdout.replace('\n', '').split(' ');
						var avg = parseFloat(loadAvgs[0].replace(',', '.'));
						var avg5 = parseFloat(loadAvgs[1].replace(',', '.'));
						var avg15 = parseFloat(loadAvgs[2].replace(',', '.'));
				  		var si = new SystemInfo({
				  			temperature: temp,
							avg: avg,
							avg5: avg5,
							avg15: avg15
				  		});
				  		si.save(function(errSavingSystemInfo, newSystemInfo) {
				  			if (errSavingSystemInfo) {
				  				log.error('Error saving systeminfo: ' + errSavingSystemInfo);
				  			}
				  			else {
				  				_this.dataSystemInfo = {
				  					temperature: newSystemInfo.temperature,
				  					avg: newSystemInfo.avg,
				  					avg5: newSystemInfo.avg5,
				  					avg15: newSystemInfo.avg15,
								};
								_this.io.emit('systeminfo', _this.dataSystemInfo);
								log.info('System info: ' + _this.dataSystemInfo.temperature + 'ºC, ' + _this.dataSystemInfo.avg + ', ' + _this.dataSystemInfo.avg5 + ', ' + _this.dataSystemInfo.avg15);
				  			}
				  		});
					}
				});
			}
		});
	}, 30000);
}

Realtime.prototype = {
	getSystemInfo: function() {
		return this.dataSystemInfo;
	},
	setElectricity: function(electricity) {
		this.electricity = electricity;
		this.io.emit('electricity', this.getElectricity());
	},
	getElectricity: function() {
		return this.electricity;
	},
	setWatering: function(watering) {
		this.watering = watering;
		this.io.emit('watering', this.getWatering());
	},
	getWatering: function () {
		return this.watering;
	},
	setSignals: function(signals) {
		for (var signal in signals) {
			this.signals[signal] = signals[signal] == 1 ? true : false;
		}
		this.io.emit('signals', this.getSignals());
	},
	getSignals: function() {
		return this.signals;
	},
	setHigrometers: function(higrometers) {
		for (var higrometer in higrometers) {
			if (this.higrometers.hasOwnProperty(higrometer)) {
				this.higrometers[higrometer] = higrometers[higrometer];
			}
		}
		this.io.emit('higrometers', this.getHigrometers());
	},
	getHigrometers: function() {
		return this.higrometers;
	},
	getDht22: function() {
		return this.dht22;
	},
	setDht22: function(dht22) {
		for (var key in dht22) {
			if (this.dht22.hasOwnProperty(key)) {
				this.dht22[key] = dht22[key];
			}
		}
		this.io.emit('dht22', this.getDht22());
	},
	sendEvent: function(event) {
		this.io.emit('event', event);
	},
	newWatering: function(newWatering) {
		this.io.emit('new-watering', newWatering);
	},
	setTimes: function(times) {
		this.times = times;
		this.io.emit('times', this.getTimes());
	},
	getTimes: function() {
		return this.times;
	},
	setChangingTimes: function(flag) {
		this.changingTimes = flag;
		this.io.emit('change-times', this.getChangingTimes());
	},
	getChangingTimes: function() {
		return this.changingTimes;
	},
};

module.exports = Realtime;