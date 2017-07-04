app.factory('realtime', function() {
	var kpis = {};
	return {
		setKpis: function (_kpis) {
			kpis = _kpis;
		},
		getKpis: function () {
			return kpis;
		}
	};
});