var fs = require("fs");
var path = require("path");

var FILE_PATHS = {
	ACCELEROMETER: "/sensors/accelerometer",
	EXPORT_FILE: "export",
	GPIO: "/sys/class/gpio",
	GYROSCOPE: "/sensors/gyroscope",
	MAGNETOMETER: "/sensors/magnetometer",
	BAROMETER: {
		PREASSURE: {
			SCALE: "/sys/class/i2c-dev/i2c-1/device/1-0060/iio\:device2/in_pressure_scale",
			RAW: "/sys/class/i2c-dev/i2c-1/device/1-0060/iio\:device2/in_pressure_raw", 
		},
		TEMPERATURE: {
			SCALE: "/sys/class/i2c-dev/i2c-1/device/1-0060/iio\:device2/in_temp_scale",
			RAW: "/sys/class/i2c-dev/i2c-1/device/1-0060/iio\:device2/in_temp_raw", 
		},
	},
	UNEXPORT_FILE: "unexport",
};

var Ref = {
	GPIOS: [
		106,	107,	180,	181,	172,	173,	182,	124,
        25,		22,		14,		15,		16,		17,		18,		19,
        20,		21,		203,	202,	177,	176,	175,	174,
        119,	124,	127,	116,	7,		6,		5,		4
	],
	DIRECTIONS: {
		INPUT: "in",
		OUTPUT: "out"
	},
	VALUES: {
		LOW: "0",
		HIGH: "1"
	},
	fromPin: function (pinNumber) {
		if (pinNumber < 16 || pinNumber > 47)
			throw new Error("Invalid pin number");
		return Ref.GPIOS[pinNumber - 16];
	},
	isValid: function (gpioNumber) {
		return Ref.GPIOS.indexOf(gpioNumber) > -1;
	}
};

var File = {
	exists: function (path) {
		try {
			fs.accessSync(path);
			return true;
		} catch (e) {
			return false;
		}
	},
	read: function (filePath) {
		return fs.readFileSync(filePath, "utf-8").replace(/(\r\n|\n|\r)/gm, "");
	},
	watch: function (filePath, callBack) {
		fs.watch(filePath, function (event) {
			if ("change" === event)
				callBack();
		});
	},
	write: function (filePath, data) {
		try {
			fs.writeFileSync(filePath, data);
		} catch (err) {
			log.err('Udoo write error: ' + err);
			if ("EBUSY" === err.errno) {
				return this.write(filePath, data);
			}
			else {
				return new Error('Error writing ' + filePath + ': ' + err);
			}
		}
	}
};

function GPIO (num) {
	if (num)
		return this.fromPin(num);
};

GPIO.prototype = {
	gpioNumber: null,
	_currentGPIO: function () {
		if (!this.gpioNumber)
			throw new Error("Missing GPIO number");
		return this.gpioNumber;
	},
	fromPin: function (num) {
		this.gpioNumber = Ref.fromPin(num);
		return this;
	},
	fromGpio: function (gpioNumber) {
		if (!Ref.isValid(gpioNumber))
			throw new Error("Gpio number (" + gpioNumber + ") is out of range.");
		this._currentGPIO = gpioNumber;
		return this;
	},
	_export: function (yes) {
		var currentNum = this._currentGPIO().toString();
        var rootPath = FILE_PATHS.GPIO + path.sep;
        var gpioFileExists = File.exists(rootPath + "gpio" + currentNum);
        if (yes && gpioFileExists)
        	return; // Already exported
        if (!yes && !gpioFileExists)
        	return; // Already unexported
        File.write(currentNum, rootPath + (yes ? FILE_PATHS.EXPORT_FILE : FILE_PATHS.UNEXPORT_FILE));
	},
	export: function () {
        this._export(true);
    },
    unexport: function () {
        this._export(false);
    },
	_paths: function () {
		var gpioPath = FILE_PATHS.GPIO + path.sep + "gpio" + this._currentGPIO();
		return  {
			value: gpioPath + path.sep + "value",
			direction: gpioPath + path.sep + "direction",
		}
	},
	_getGpioNumber: function () {
		if (!Ref.isValid(this.gpioNumber))
			throw new Error("GPIO number (" + this.gpioNumber + ") is out of range");
		else
			return this.gpioNumber;
	},
	_getDirection: function () {
		return File.read(this._paths().direction);
	},
	_setDirection: function (direction) {
		if (direction != Ref.DIRECTIONS.INPUT && direction != Ref.DIRECTIONS.OUTPUT)
			throw new Error("Invalid direction");
		this.export();
		File.write(this._paths().direction, direction);
		return this;
	},
	_getValue: function () {
		return File.read(this._paths().value);
	},
	_setValue: function (value) {
		this.export();
		if (value != Ref.VALUES.LOW && value != Ref.VALUES.HIGH)
			throw new Error("Invalid value");
		File.write(this._paths().value, value);
		return this;
	},
	_watchValue: function (callBack) {
		this.export();
		File.watch(this._paths().value, function () {
			callBack();
		});
	},
	_watchDirection: function (callBack) {
		File.watch(this._paths().direction, function () {
			callBack();
		});	
	},
	// Shorthands
	in: function () {
		return this._setDirection(Ref.DIRECTIONS.INPUT);
	},
	out: function () {
		return this._setDirection(Ref.DIRECTIONS.OUTPUT);
	},
	direction: function (direction) {
		this.export();
		if (!direction)
			return this._getDirection();
		return this._setDirection(direction);
	},
	val: function (value) {
		if (!value)
			return this._getValue();
		return this._setValue(value);
	},
	num: function () {
		return this._getGpioNumber();
	},
	watchValue: function (callBack) {
		this._watchValue(callBack);
	},
	watchDirection: function (callBack) {
		this._watchDirection(callBack);
	}
};

function MotionSensor(path) {
	this.path = path;
}

MotionSensor.prototype = {
	_enable: function (y) {
		File.write((y ? 1 : 0).toString(), this.path + path.sep + (y ? "enable" : "disable"));
	},
	enable: function() {
		this._enable(true);
		return this;
	},
	disable: function() {
		this._enable(false);
		return this;
	},
	getData: function() {
		return File.read(this.path + path.sep + "data");
	},
	// Shorthands
	on: function () {
		return this.enable();
	},
	off: function () {
		return this.disable();
	},
	data: function () {
		return this.getData();
	}
}

function BarometerSensor(path) {
	this.pathTempScale = path.TEMPERATURE.SCALE;
	this.pathTempRaw = path.TEMPERATURE.RAW;
	this.pathPresScale = path.PREASSURE.SCALE;
	this.pathPresRaw = path.PREASSURE.RAW;
}

BarometerSensor.prototype = {
	_getData: function (path) {
		return File.read(path);
	},
	getTemperatureScaleData: function () {
		return this._getData(this.pathTempScale);
	},
	getTemperatureRawData: function () {
		return this._getData(this.pathTempRaw);
	},
	getPressureScaleData: function () {
		return this._getData(this.pathPresScale);
	},
	getPressureRawData: function () {
		return this._getData(this.pathPresRaw);
	},
	getTemperatureData: function () {
		return parseFloat(this.getTemperatureScaleData()) * parseFloat(this.getTemperatureRawData());
	},
	getPressureData: function () {
		return parseFloat(this.getPressureScaleData()) * parseFloat(this.getPressureRawData());
	},
};

module.exports = {
	GPIO: GPIO,
	DIRECTIONS: Ref.DIRECTIONS,
	VALUES: Ref.VALUES,
	gpioNumbers: Ref.GPIOS,
	gpios: {
		each: function (callBack) {
			var num = Ref.GPIOS.length;
			while (num--)
				callBack(new GPIO().fromGpio(Ref.gpios[num]));
		}
	},
	sensors: {
		Accelerometer: new MotionSensor(FILE_PATHS.ACCELEROMETER),
		Gyroscope: new MotionSensor(FILE_PATHS.GYROSCOPE),
		Magnetometer: new MotionSensor(FILE_PATHS.MAGNETOMETER),
		BarometerSensor: new BarometerSensor(FILE_PATHS.BAROMETER)
	}
};