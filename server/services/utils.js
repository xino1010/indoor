
module.exports = {
	getToday: function() {
		var tmp = new Date();
		tmp.setHours(0, 0, 0, 0);
		return tmp;
	},
	getDateByNdays: function (n) {
		var tmp = new Date();
		tmp.setDate(tmp.getDate() + n);
		tmp.setHours(0, 0, 0,0);
		return tmp;
	},
	getTodayDate: function() {
		return new Date(new Date().setHours(0,0,0,0));
	},
};