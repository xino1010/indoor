app.controller('mainController', function($rootScope, $scope, $window, $location, $interval, auth, users, socket, localstorage, realtime) {
	$rootScope.$on('kpis', function(event, data){
		if (data != null) {
			$scope.kpis = data;
			$scope.$apply();
		}
	});
	$scope.user = auth.getUser();
	$scope.users = users.getUsers();
	$scope.kpis = [];
	$scope.dataDht22 = [];
	$scope.dataHigrometers = [];
	$scope.dataElectricity = [];
	$scope.dataSysteminfo = [];
	$scope.sensors = {
		dht22: {
			temperature: {
				lastHour: {
					registers: 0,
					average: 0
				},
				lastDay: {
					registers: 0,
					average: 0
				},
				lastWeek: {
					registers: 0,
					average: 0
				},
			},
			humidity: {
				lastHour: {
					registers: 0,
					average: 0
				},
				lastDay: {
					registers: 0,
					average: 0
				},
				lastWeek: {
					registers: 0,
					average: 0
				},
			},
		},
	}
	$scope.events = [];
	$scope.waterings = [];
	$scope.chartColors = {
		red: 'rgb(255, 99, 132)',
		blue: 'rgb(54, 162, 235)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		purple: 'rgb(153, 102, 255)',
		brown: 'rgb(63, 191, 63)'
	};
    $scope.configDht22 = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: "Temperatura",
                backgroundColor: $scope.chartColors.red,
                borderColor: $scope.chartColors.red,
                data: [],
                fill: false,
            }, {
                label: "Humedad",
                fill: false,
                backgroundColor: $scope.chartColors.blue,
                borderColor: $scope.chartColors.blue,
                data: [],
            }, {
                label: "Temperatura sistema",
                backgroundColor: $scope.chartColors.orange,
                borderColor: $scope.chartColors.orange,
                data: [],
                fill: false,
            }, ]
        },
        options: {
            responsive: true,
            title:{
                display:true,
                text:'Sensor DHT22 día y hora'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItems, data) {
                    	var label = data.datasets[tooltipItems.datasetIndex].label;
                    	var unity = null;
                    	if (tooltipItems.datasetIndex == 0 || tooltipItems.datasetIndex == 2)
                        	unity = 'ºC';
                        else
                        	unity = '%';
                        return ' ' + label + ': ' + tooltipItems.yLabel + unity;
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Fecha'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Valor'
                    }
                }]
            }
        }
    };
	$scope.configHigrometers = {
        type: 'line',
        data: {
            labels: [],
            datasets: [
	            {
	                label: "Higrómetro 1",
	                backgroundColor: $scope.chartColors.orange,
	                borderColor: $scope.chartColors.orange,
	                data: [],
	                fill: false,
	            },
	            {
	                label: "Higrómetro 2",
	                backgroundColor: $scope.chartColors.yellow,
	                borderColor: $scope.chartColors.yellow,
	                data: [],
	                fill: false,
	            },
	            {
	                label: "Higrómetro 4",
	                backgroundColor: $scope.chartColors.green,
	                borderColor: $scope.chartColors.green,
	                data: [],
	                fill: false,
	            },
	            {
	                label: "Higrómetro 4",
	                backgroundColor: $scope.chartColors.purple,
	                borderColor: $scope.chartColors.purple,
	                data: [],
	                fill: false,
	            },
            ]
        },
        options: {
            responsive: true,
            title:{
                display:true,
                text:'Higrómetros FC-28 día y hora'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItems, data) {
                    	var label = data.datasets[tooltipItems.datasetIndex].label;
                    	return ' ' + label + ': ' + tooltipItems.yLabel + '%';
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Fecha'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Porcentaje'
                    }
                }]
            }
        }
    };
	$scope.configElectricity = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: "Potencia",
                backgroundColor: $scope.chartColors.brown,
                borderColor: $scope.chartColors.brown,
                data: [],
                fill: false,
            }]
        },
        options: {
            responsive: true,
            title:{
                display:true,
                text:'SCT-013-030 consumo día y hora'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItems, data) {
                    	var label = data.datasets[tooltipItems.datasetIndex].label;
                        return ' ' + label + ': ' + tooltipItems.yLabel + 'W';
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Fecha'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Vatios'
                    }
                }]
            }
        }
    };
    $scope.configSysteminfo = {
        type: 'line',
        data: {
            labels: [],
            datasets: [
            	{
	                label: "Carga",
	                backgroundColor: $scope.chartColors.red,
	                borderColor: $scope.chartColors.red,
	                data: [],
	                fill: false,
	            },
	            {
	                label: "Carga 5 min",
	                backgroundColor: $scope.chartColors.yellow,
	                borderColor: $scope.chartColors.yellow,
	                data: [],
	                fill: false,
	            },
	            {
	                label: "Carga 15 min",
	                backgroundColor: $scope.chartColors.green,
	                borderColor: $scope.chartColors.green,
	                data: [],
	                fill: false,
	            },
            ]
        },
        options: {
            responsive: true,
            title:{
                display:true,
                text:'Carga día y hora'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItems, data) { 
                    	var label = data.datasets[tooltipItems.datasetIndex].label;
                        return ' ' + label + ': ' + tooltipItems.yLabel;
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Fecha'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Valor'
                    }
                }]
            }
        }
    };

    $scope.ctxDht22 = angular.element("#canvasDht22")[0].getContext("2d");
    $scope.dht22Chart = new Chart($scope.ctxDht22, $scope.configDht22);
	$scope.ctxHigrometers = angular.element("#canvasHigrometers")[0].getContext("2d");
    $scope.HigrometersChart = new Chart($scope.ctxHigrometers, $scope.configHigrometers);
    $scope.ctxElectricity = angular.element("#canvasElectricity")[0].getContext("2d");
    $scope.ElectricityChart = new Chart($scope.ctxElectricity, $scope.configElectricity);
    $scope.ctxSysteminfo = angular.element("#canvasSysteminfo")[0].getContext("2d");
    $scope.SysteminfoChart = new Chart($scope.ctxSysteminfo, $scope.configSysteminfo);

	addPointToGraphic = function(graphicKey, point) {
		var date = new Date();
		if (graphicKey == "dht22") {
			$scope.configDht22.data.labels.push(date.mmddhhii());
			$scope.configDht22.data.datasets[0].data.push(point.temperature);
			$scope.configDht22.data.datasets[1].data.push(point.humidity);
			$scope.dht22Chart.update();
		}
		else if (graphicKey == "higrometers") {
			$scope.configHigrometers.data.labels.push(date.mmddhhii());
			$scope.configHigrometers.data.datasets[0].data.push(point.higrometer1);
			$scope.configHigrometers.data.datasets[1].data.push(point.higrometer2);
			$scope.configHigrometers.data.datasets[2].data.push(point.higrometer3);
			$scope.configHigrometers.data.datasets[3].data.push(point.higrometer4);
			$scope.HigrometersChart.update();
		}
	};

	getDiffSecondsBetweenDates = function(dateInf, dateSup) {
		var t1 = new Date(dateInf);
		var t2 = new Date(dateSup);
		var diff = t1.getTime() - t2.getTime();
		return Math.abs(diff / 1000);
	};

	initSensors = function() {
		$scope.sensors.dht22.temperature.lastHour.average = 0;
		$scope.sensors.dht22.temperature.lastHour.registers = 0;
		$scope.sensors.dht22.temperature.lastDay.average = 0;
		$scope.sensors.dht22.temperature.lastDay.registers = 0;
		$scope.sensors.dht22.humidity.lastHour.average = 0;
		$scope.sensors.dht22.humidity.lastHour.registers = 0;
		$scope.sensors.dht22.humidity.lastDay.average = 0;
		$scope.sensors.dht22.humidity.lastDay.registers = 0;
	};

	updateGraphicsDht22 = function() {
		var timeKeys = [];
		var result = {};
		for (var i = 0; i < $scope.dataDht22.length; i++) {
			var element = $scope.dataDht22[i];
			var dt = new Date(element.date);
			var day = dt.getDate();
			var strDay = day.toString();
			if (day < 10)
				strDay = "0" + strDay;
			var hour = dt.getHours();
			var strHour = hour.toString();
			if (hour < 10)
				strHour = "0" + strHour;
			var key = strDay + "-" + strHour;
			if (!result.hasOwnProperty(key)) {
				timeKeys.push(key);
				result[key] = {
					temperature: {
						registers: 0,
						accum: 0
					},
					humidity: {
						registers: 0,
						accum: 0
					}
				};
			}
			result[key].temperature.registers++;
			result[key].temperature.accum += element.temperature;
			result[key].humidity.registers++;
			result[key].humidity.accum += element.humidity;
		}
		timeKeys.sort();
		for (var i = 0; i < timeKeys.length; i++) {
			var key = timeKeys[i];
			var averageTemperature = result[key].temperature.accum / result[key].temperature.registers;
			$scope.configDht22.data.datasets[0].data.push(averageTemperature.toFixed(2));
			var averageHumidity = result[key].humidity.accum / result[key].humidity.registers;
			$scope.configDht22.data.datasets[1].data.push(averageHumidity.toFixed(2));
			$scope.configDht22.data.labels.push(key);
		}
		$scope.dht22Chart.update();
	};

	updateGraphicsHigrometers = function() {
		var timeKeys = [];
		var result = {};
		for (var i = 0; i < $scope.dataHigrometers.length; i++) {
			var element = $scope.dataHigrometers[i];
			var dt = new Date(element.date);
			var day = dt.getDate();
			var strDay = day.toString();
			if (day < 10)
				strDay = "0" + strDay;
			var hour = dt.getHours();
			var strHour = hour.toString();
			if (hour < 10)
				strHour = "0" + strHour;
			var key = strDay + "-" + strHour;
			if (!result.hasOwnProperty(key)) {
				timeKeys.push(key);
				result[key] = {
					higrometer1: {
						registers: 0,
						accum: 0
					},
					higrometer2: {
						registers: 0,
						accum: 0
					},
					higrometer3: {
						registers: 0,
						accum: 0
					},
					higrometer4: {
						registers: 0,
						accum: 0
					},
					
				};
			}
			result[key].higrometer1.registers++;
			result[key].higrometer1.accum += element.higrometer1;
			result[key].higrometer2.registers++;
			result[key].higrometer2.accum += element.higrometer2;
			result[key].higrometer3.registers++;
			result[key].higrometer3.accum += element.higrometer3;
			result[key].higrometer4.registers++;
			result[key].higrometer4.accum += element.higrometer4;
		}
		timeKeys.sort();
		for (var i = 0; i < timeKeys.length; i++) {
			var key = timeKeys[i];
			var averageHigrometer1 = result[key].higrometer1.accum / result[key].higrometer1.registers;
			$scope.configHigrometers.data.datasets[0].data.push(averageHigrometer1.toFixed(2));
			var averageHigrometer2 = result[key].higrometer2.accum / result[key].higrometer2.registers;
			$scope.configHigrometers.data.datasets[1].data.push(averageHigrometer2.toFixed(2));
			var averageHigrometer3 = result[key].higrometer3.accum / result[key].higrometer3.registers;
			$scope.configHigrometers.data.datasets[2].data.push(averageHigrometer3.toFixed(2));
			var averageHigrometer4 = result[key].higrometer4.accum / result[key].higrometer4.registers;
			$scope.configHigrometers.data.datasets[3].data.push(averageHigrometer4.toFixed(2));
			$scope.configHigrometers.data.labels.push(key);
		}
		$scope.HigrometersChart.update();
	};

	updateGraphicsElectricity = function() {
		var timeKeys = [];
		var result = {};
		for (var i = 0; i < $scope.dataElectricity.length; i++) {
			var element = $scope.dataElectricity[i];
			var dt = new Date(element.date);
			var day = dt.getDate();
			var strDay = day.toString();
			if (day < 10)
				strDay = "0" + strDay;
			var hour = dt.getHours();
			var strHour = hour.toString();
			if (hour < 10)
				strHour = "0" +  strHour;
			var key = strDay + "-" + strHour;
			if (!result.hasOwnProperty(key)) {
				timeKeys.push(key);
				result[key] = {
					watts: {
						registers: 0,
						accum: 0
					}
				};
			}
			result[key].watts.registers++;
			result[key].watts.accum += element.watts;
		}
		timeKeys.sort();
		for (var i = 0; i < timeKeys.length; i++) {
			var key = timeKeys[i];
			var averageWatts = result[key].watts.accum / result[key].watts.registers;
			$scope.configElectricity.data.datasets[0].data.push(averageWatts.toFixed(2));
			$scope.configElectricity.data.labels.push(key);
		}
		$scope.ElectricityChart.update();
	};

	updateGraphicsSysteminfo = function (){
		var timeKeys = [];
		var result = {};
		for (var i = 0; i < $scope.dataSysteminfo.length; i++) {
			var element = $scope.dataSysteminfo[i];
			var dt = new Date(element.date);
			var day = dt.getDate();
			var strDay = day.toString();
			if (day < 10)
				strDay = "0" + strDay;
			var hour = dt.getHours();
			var strHour = hour.toString();
			if (hour < 10)
				strHour = "0" + strHour;
			var key = strDay + "-" + strHour;
			if (!result.hasOwnProperty(key)) {
				timeKeys.push(key);
				result[key] = {
					temperature: {
						registers: 0,
						accum: 0
					},
					avg: {
						registers: 0,
						accum: 0
					},
					avg5: {
						registers: 0,
						accum: 0
					},
					avg15: {
						registers: 0,
						accum: 0
					}
				};
			}
			result[key].temperature.registers++;
			result[key].temperature.accum += parseFloat(element.temperature);
			result[key].avg.registers++;
			result[key].avg.accum += parseFloat(element.avg);
			result[key].avg5.registers++;
			result[key].avg5.accum += parseFloat(element.avg5);
			result[key].avg15.registers++;
			result[key].avg15.accum += parseFloat(element.avg15);
		}
		timeKeys.sort();
		for (var i = 0; i < timeKeys.length; i++) {
			var key = timeKeys[i];
			var averageAvg = result[key].avg.accum / result[key].avg.registers;
			$scope.configSysteminfo.data.datasets[0].data.push(averageAvg.toFixed(2));
			var averageAvg5 = result[key].avg5.accum / result[key].avg5.registers;
			$scope.configSysteminfo.data.datasets[1].data.push(averageAvg5.toFixed(2));
			var averageAvg15 = result[key].avg15.accum / result[key].avg15.registers;
			$scope.configSysteminfo.data.datasets[2].data.push(averageAvg15.toFixed(2));
			$scope.configSysteminfo.data.labels.push(key);
			var averageTemperature = result[key].temperature.accum / result[key].temperature.registers;
			$scope.configDht22.data.datasets[2].data.push(averageTemperature.toFixed(2));
			var index = $scope.configDht22.data.labels.indexOf(key)
			if (index == -1)
				$scope.configDht22.data.labels.push(key);
		}
		$scope.SysteminfoChart.update();
		$scope.dht22Chart.update();
	};

	updateSensors = function() {
		initSensors();
		var numberOfDataDht22 = $scope.dataDht22.length;
		for (var i = 0; i < $scope.dataDht22.length; i++) {
			var element  = $scope.dataDht22[i];
			var diffSeconds = getDiffSecondsBetweenDates(Date.now(), element.date);
			// Última hora
			if (diffSeconds <= 3600) {
				$scope.sensors.dht22.temperature.lastHour.registers++;
				$scope.sensors.dht22.temperature.lastHour.average += element.temperature;
				$scope.sensors.dht22.humidity.lastHour.registers++;
				$scope.sensors.dht22.humidity.lastHour.average += element.humidity;
			}
			$scope.sensors.dht22.temperature.lastDay.registers++;
			$scope.sensors.dht22.temperature.lastDay.average += element.temperature;
			$scope.sensors.dht22.humidity.lastDay.registers++;
			$scope.sensors.dht22.humidity.lastDay.average += element.humidity;
		}
		$scope.sensors.dht22.temperature.lastHour.average /= $scope.sensors.dht22.temperature.lastHour.registers;
		$scope.sensors.dht22.temperature.lastDay.average /= $scope.sensors.dht22.temperature.lastDay.registers;
		$scope.sensors.dht22.humidity.lastHour.average /= $scope.sensors.dht22.humidity.lastHour.registers;
		$scope.sensors.dht22.humidity.lastDay.average /= $scope.sensors.dht22.humidity.lastDay.registers;
	};

	updateAverages = function(dataAverages) {
		$scope.sensors.dht22.temperature.lastWeek.registers = 0;
		$scope.sensors.dht22.temperature.lastWeek.average = 0;
		$scope.sensors.dht22.humidity.lastWeek.registers = 0;
		$scope.sensors.dht22.humidity.lastWeek.average = 0;
		for (var i = 0; i < dataAverages.length; i++) {
			$scope.sensors.dht22.temperature.lastWeek.registers++;
			$scope.sensors.dht22.temperature.lastWeek.average += dataAverages[i].temperature;
			$scope.sensors.dht22.humidity.lastWeek.registers++;
			$scope.sensors.dht22.humidity.lastWeek.average += dataAverages[i].humidity;
		}
		$scope.sensors.dht22.temperature.lastWeek.average /= $scope.sensors.dht22.temperature.lastWeek.registers;
		$scope.sensors.dht22.humidity.lastWeek.average /= $scope.sensors.dht22.humidity.lastWeek.registers;
	};

	socket.on('data-dht22-24h', function(dataDht22) {
		$scope.dataDht22 = dataDht22;
		updateSensors();
		updateGraphicsDht22();
	});
	socket.on('data-higrometers-24h', function(dataHigrometers) {
		$scope.dataHigrometers = dataHigrometers;
		updateGraphicsHigrometers();
	});
	socket.on('data-electricity-24h', function(dataElectricity) {
		$scope.dataElectricity = dataElectricity;
		updateGraphicsElectricity();
	});
	socket.on('data-systeminfo-24h', function(dataSysteminfo) {
		$scope.dataSysteminfo = dataSysteminfo;
		updateGraphicsSysteminfo();
	});
	socket.on('data-averages-dht22', function(dataAverages) {
		updateAverages(dataAverages);
	});
	socket.on('data-events', function(dataEvents) {
		$scope.events = dataEvents;
	});
	socket.on('data-waterings', function(dataWaterings) {
		$scope.waterings = dataWaterings;
	});
	socket.on('new-watering', function(newWatering) {
		$scope.waterings.unshift(newWatering);
	});
	socket.on('event', function(event) {
		$scope.events.pop();
		$scope.events.unshift(event);
	});
	$scope.watering = false;
	$scope.water = function() {
		socket.emit('water', true);
	};
	socket.on('watering', function(data) {
		$scope.watering = data;
	});
	$scope.changingTimes = false;
	$scope.changeTimes = function() {
		var info = {};
		for (var key in $scope.kpis) {
			if ($scope.kpis[key].editable) {
				info[key] = $scope.kpis[key].value * 1000;
			}
		}
		var obj = {
			active: true,
			data: info
		}
		socket.emit('change-times', obj);
	};
	socket.on('change-times', function(flag) {
		$scope.changingTimes = flag;
	});
	socket.on('times', function(data) {
		for (var key in data) {
			if ($scope.kpis.hasOwnProperty(key)) {
				$scope.times[key].value = data[key] / 1000;
			}
		}
	});

	$scope.logout = function() {
		users.removeUsers();
		localstorage.clearData();
        socket.disconnect(function() {
            console.log('Disconnected successfully to websocket');
            $location.path('/login');
        });
	};

	Date.prototype.mmddhhii = function () {
	  	var mm = this.getMonth() + 1;
	  	var dd = this.getDate();
	  	return [(mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-') + ' ' + this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds();
	};

	socket.on('force-disconnect', function () {
		$scope.logout();
	});

	$scope.$on('$destroy', function () {
		socket.disconnect();
    });

	$window.onbeforeunload = function() {
		users.removeUsers();
		localstorage.clearData();
        socket.disconnect(function() {
            console.log('Disconnected successfully to websocket');
        });
	};

});