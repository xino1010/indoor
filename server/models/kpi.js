function Kpi (key, value, name, unity, color, colorActivated, icon, canBeActivated, activated) {
	this.key = key;
	this.value = value;
	this.name = name;
	this.unity = unity;
	this.color = color;
	this.colorActivated = colorActivated;
	this.icon = icon;
	this.canBeActivated = canBeActivated;
	this.activated = activated;
}

Kpi.prototype = {
	getKey: function () {
		return this.key;
	},
	setKey: function(key) {
		this.key = key;
	},
	getValue: function () {
		return this.value;
	},
	setValue: function (value) {
		this.value = value;
	},
	getName: function () {
		return this.name;
	},
	setName: function (name) {
		this.name = name;
	},
	getUnity: function () {
		return this.unity;
	},
	setUnity: function (unity) {
		this.unity = unity;
	},
	getColor: function () {
		return this.color;
	},
	setColor: function (color) {
		this.color = color;
	},
	getColorActivated: function () {
		return this.colorActivated;
	},
	setColorActivated: function (colorActivated) {
		this.colorActivated = colorActivated;
	},
	getIcon: function () {
		return this.icon;
	},
	setIcon: function (icon) {
		this.icon = icon;
	},
	getCanBeActivated: function () {
		return this.canBeActivated;
	},
	setCanBeActivated: function (canBeActivated) {
		this.canBeActivated = canBeActivated;
	},
	getActivated: function () {
		return this.activated;
	},
	setActivated: function (activated) {
		this.activated = activated;
	}
};

module.exports = Kpi;