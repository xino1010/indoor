var DHT22 = require('../models/dht22');
var CronJob = require('cron').CronJob;
var AverageDHT22 = require('../models/averagedht22');
var Utils = require('./utils');
var Higrometer = require('../models/higrometer');
var Electricity = require('../models/electricity');
var AverageElectricity = require('../models/averageelectricity');
var SystemInfo = require('../models/systeminfo');
var AverageSystemInfo = require('../models/avergatesysteminfo');

function Crontab() {
	this.jobCalculateAverageDht22Day = new CronJob('00 05 00 * * *', function() {
		var yesterday = Utils.getDateByNdays(-1);
		var today = Utils.getTodayDate();
	  	DHT22.find({
		  	date: {
		  		$gte: yesterday,
		  		$lt: today,
		  	}
		}, function (err, registers) {
			if (err)
				log.error('Error crontab "jobCalculateAverageDht22Day": ' + err);
			else {
				var numRegisters = registers.length;
				if (numRegisters) {
					var result = {
						temperature: {
							registers: 0,
							average: 0,
						},
						humidity: {
							registers: 0,
							average: 0,
						}
					};
					for (var i = 0; i < registers.length; i++) {
						result.temperature.registers++;
						result.temperature.average += registers[i].temperature;
						result.humidity.registers++;
						result.humidity.average += registers[i].humidity;
					}
					result.temperature.average /= result.temperature.registers;
					result.humidity.average /= result.humidity.registers;
					var average = AverageDHT22({
						date: yesterday,
						temperature: result.temperature.average,
						humidity: result.humidity.average,
					});
					average.save(function(err, newAverage) {
						if (newAverage) {
							log.error('Error crontab "jobCalculateAverageDht22Day" new average for ' + yesterday + ': ' + err);
						}
						else {
							log.info('Dht22 average: temp ' +  newAverage.temperature + 'ºC, humd ' + newAverage.humidity + '%');
							// Eliminar registros con 2 meses de antigüedad
							var twoMonthsBefore = Utils.getDateByNdays(60);
							DHT22.remove({
							  	date: {
							  		$lte: twoMonthsBefore,
							  	}
							}, function(errDht22Remove) {
								if (errDht22Remove) {
									log.error('Error deleting Dht22 registers previous to ' + twoMonthsBefore + ': ' + errDht22Remove);
								}
								else {
									log.info('Deleted Dht22 registers prior to ' + twoMonthsBefore);
								}
							});
							Higrometer.remove({
							  	date: {
							  		$lte: twoMonthsBefore,
							  	}
							}, function(errHigrometerRemove) {
								if (err) {
									log.error('Error deleting higrometer registers previous to ' + twoMonthsBefore  + ': ' + errHigrometerRemove);
								}
								else {
									log.info('Deleted higrometer registers prior to ' + twoMonthsBefore);
								}
							});
						}
					})
				}
			}
		});
	}, null, true, 'Europe/Madrid');
	this.jobCalculateElectricity22Day = new CronJob('00 10 00 * * *', function() {
		var yesterday = Utils.getDateByNdays(-1);
		var today = Utils.getTodayDate();
	  	Electricity.find({
		  	date: {
		  		$gte: yesterday,
		  		$lt: today,
		  	}
		}, function (err, registers) {
			if (err)
				log.error('Error crontab "jobCalculateAverageDht22Day": ' + err);
			else {
				var numRegisters = registers.length;
				if (numRegisters) {
					var result = {
						irms: {
							registers: 0,
							average: 0,
						},
						power: {
							registers: 0,
							average: 0,
						},
						watts: {
							registers: 0,
							average: 0,
						},
					};
					for (var i = 0; i < registers.length; i++) {
						result.irms.registers++;
						result.irms.average += registers[i].irms;
						result.power.registers++;
						result.power.average += registers[i].power;
						result.watts.registers++;
						result.watts.average += registers[i].watts;
					}
					result.irms.average /= result.irms.registers;
					result.power.average /= result.power.registers;
					result.watts.average /= result.watts.registers;
					var average = AverageElectricity({
						date: yesterday,
						irms: result.irms.average,
						power: result.power.average,
						watts: result.watts.average,
					});
					average.save(function(err, newAverage) {
						if (err) {
							log.error('Error crontab "jobCalculateElectricity22Day" new average for ' + yesterday + ': ' + err);
						}
						else {
							log.info('Electricity average: ' +  newAverage.irms + 'A, ' + newAverage.power + 'P, ' + newAverage.watts + 'W');
							// Eliminar registros con 2 meses de antigüedad
							var twoMonthsBefore = Utils.getDateByNdays(-90);
							Electricity.remove({
							  	date: {
							  		$lte: twoMonthsBefore,
							  	}
							}, function(errElectricity) {
								if (errElectricity) {
									log.error('Error deleting Electricity registers previous to ' + twoMonthsBefore + ': ' + errDht22Remove);
								}
								else {
									log.info('Deleted Electricity registers prior to ' + twoMonthsBefore);
								}
							});
						}
					})
				}
			}
		});
	}, null, true, 'Europe/Madrid');
	this.jobCalculateSystemInfoDay = new CronJob('00 15 00 * * *', function() {
		var yesterday = Utils.getDateByNdays(-1);
		var today = Utils.getTodayDate();
	  	SystemInfo.find({
		  	date: {
		  		$gte: yesterday,
		  		$lt: today,
		  	}
		}, function (err, registers) {
			if (err)
				log.error('Error crontab "jobCalculateSystemInfoDay": ' + err);
			else {
				var numRegisters = registers.length;
				log.info(numRegisters)
				if (numRegisters) {
					var result = {
						temperature: {
							registers: 0,
							average: 0,
						},
						avg: {
							registers: 0,
							average: 0,
						},
						avg5: {
							registers: 0,
							average: 0,
						},
						avg15: {
							registers: 0,
							average: 0,
						}
					};
					for (var i = 0; i < registers.length; i++) {
						result.temperature.registers++;
						result.temperature.average += registers[i].temperature;
						result.avg.registers++;
						result.avg.average += registers[i].avg;
						result.avg5.registers++;
						result.avg5.average += registers[i].avg;
						result.avg15.registers++;
						result.avg15.average += registers[i].avg;
					}
					result.temperature.average /= result.temperature.registers;
					result.avg.average /= result.avg.registers;
					result.avg5.average /= result.avg5.registers;
					result.avg15.average /= result.avg15.registers;
					var average = AverageSystemInfo({
						date: yesterday,
						temperature: result.temperature.average,
						avg: result.avg.average,
						avg5: result.avg5.average,
						avg15: result.avg15.average,
					});
					average.save(function(errNewAverageSystemInfo, newAverageSystemInfo) {
						if (errNewAverageSystemInfo) {
							log.error('Error crontab "jobCalculateSystemInfoDay" new average for ' + yesterday + ': ' + errNewAverageSystemInfo);
						}
						else {
							log.info('Sistem info average: temp ' +  newAverageSystemInfo.temperature + 'ºC, avg ' + newAverageSystemInfo.avg + ', avg5 ' + newAverageSystemInfo.avg5 + ', ' + newAverageSystemInfo.avg15);
							// Eliminar registros con 2 meses de antigüedad
							var twoMonthsBefore = Utils.getDateByNdays(60);
							SystemInfo.remove({
							  	date: {
							  		$lte: twoMonthsBefore,
							  	}
							}, function(errSystemInfoRemove) {
								if (errSystemInfoRemove) {
									log.error('Error deleting System info registers previous to ' + twoMonthsBefore + ': ' + errSystemInfoRemove);
								}
								else {
									log.info('Deleted System info registers prior to ' + twoMonthsBefore);
								}
							});							
						}
					})
				}
			}
		});
	}, null, true, 'Europe/Madrid');
};

Crontab.prototype = {};

module.exports = Crontab;