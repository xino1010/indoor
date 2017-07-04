app.factory('realtime', function($rootScope) {
	var kpis = {};
	return {
		setKpis: function (_kpis) {
			kpis = _kpis;
            $rootScope.$broadcast('kpis', this.getKpis());
		},
		getKpis: function () {
			return kpis;
		}
	};
});