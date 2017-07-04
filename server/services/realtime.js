var exec = require('child_process').exec;
var SystemInfo = require('../models/systeminfo');
var Kpi = require('../models/kpi');

function Realtime (io) {
	var _this = this;
	this.io = io;
	this.watering = false;
	this.changingTimes = false;
	this.kpis = {
		amps: new Kpi('amps', 0, 'Amperios', 'A', '#f39c12', null, 'fa-bolt', false, null),
		power: new Kpi('power', 0, 'Potencia', 'W', '#f39c12', null, 'fa-bolt', false, null),
		consumption: new Kpi('consumption', 0, 'Consumo', 'W', '#f39c12', null, 'fa-bolt', false, null),
		roomTemperature: new Kpi('roomTemperature', 0, 'Temperatura Ambiente', 'ºC', '#dd4b39', null, 'fa-thermometer-quarter', false, null),
		roomHumidity: new Kpi('roomHumidity', 0, 'Humedad Ambiente', '%', '#00c0ef', null, 'fa-cloud', false, null),
		systemTemperature: new Kpi('systemTemperature', 0, 'Temperatura Sistema', 'ºC', '#605ca8', null, 'fa-thermometer-full', false, null),
		loadSystem: new Kpi('loadSystem', 0, 'Carga Sistema', null, '#605ca8', null, 'fa-spinner', false, null),
		loadSystem5: new Kpi('loadSystem', 0, "Carga Sistema 5'", null, '#605ca8', null, 'fa-spinner', false, null),
		loadSystem15: new Kpi('loadSystem', 0, "Carga Sistema 15'", null, '#605ca8', null, 'fa-spinner', false, null),
		higrometer1: new Kpi('higrometer1', 0, 'Higrómetro 1', '%', '#00a65a', null, 'fa-leaf', false, null),
		higrometer2: new Kpi('higrometer2', 0, 'Higrómetro 2', '%', '#00a65a', null, 'fa-leaf', false, null),
		higrometer3: new Kpi('higrometer3', 0, 'Higrómetro 3', '%', '#00a65a', null, 'fa-leaf', false, null),
		higrometer4: new Kpi('higrometer4', 0, 'Higrómetro 4', '%', '#00a65a', null, 'fa-leaf', false, null),
		bomb: new Kpi('bomb', null, 'Tanque agua', null, '#001f3f', '#605ca8', 'fa-signal', true, false),
		lowLevelBomb: new Kpi('lowLevelBomb', null, 'Nivel bajo tanque agua', null, '#001f3f', '#605ca8', 'fa-signal', true, false),
		solenoid1: new Kpi('solenoid1', null, 'Electroválvula 1', null, '#001f3f', '#605ca8', 'fa-signal', true, false),
		solenoid2: new Kpi('solenoid2', null, 'Electroválvula 2', null, '#001f3f', '#605ca8', 'fa-signal', true, false),
		solenoid3: new Kpi('solenoid3', null, 'Electroválvula 3', null, '#001f3f', '#605ca8', 'fa-signal', true, false),
		solenoid4: new Kpi('solenoid4', null, 'Electroválvula 4', null, '#001f3f', '#605ca8', 'fa-signal', true, false),
	};
	this.times = {
		solenoid1: 0,
		solenoid2: 0,
		solenoid3: 0,
		solenoid4: 0,
		bomb: 0,
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
				  				_this.kpis.systemTemperature.setValue(newSystemInfo.temperature);
				  				_this.kpis.loadSystem.setValue(newSystemInfo.avg);
				  				_this.kpis.loadSystem5.setValue(newSystemInfo.avg5);
				  				_this.kpis.loadSystem15.setValue(newSystemInfo.avg15);
								log.info('System info: ' + newSystemInfo.temperature + 'ºC, ' + newSystemInfo.avg + ', ' + newSystemInfo.avg5 + ', ' + newSystemInfo.avg15);
				  			}
				  		});
					}
				});
			}
		});
	}, 30000);
}

Realtime.prototype = {
	setElectricity: function(electricity) {
		for (var key in electricity) {
			if (this.kpis.hasOwnProperty(key)) {
				this.kpis[key].setValue(electricity[key]);
			}
		}
		this.sendKpis();
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
			if (this.kpis.hasOwnProperty(signal)) {
				this.kpis[signal].setActive(signals[signal] == 1 ? true : false);
			}
		}
		this.sendKpis();
	},
	setHigrometers: function(higrometers) {
		for (var higrometer in higrometers) {
			if (this.kpis.hasOwnProperty(higrometer)) {
				this.kpis[higrometer].setValue(higrometers[higrometer]);
			}
		}
		this.sendKpis();
	},
	setDht22: function(dht22) {
		for (var key in dht22) {
			if (this.kpis.hasOwnProperty(key)) {
				this.kpis[key].setValue(dht22[key]);
			}
		}
		this.sendKpis();
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
	sendKpis: function () {
		this.io.emit('kpis', this.kpis);
	},
	getKpis: function() {
		return this.kpis;
	}
};

module.exports = Realtime;