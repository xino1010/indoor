app.factory('localstorage', function($rootScope, $window) {

	return {
		setData: function(key, value) {
			$window.localStorage && $window.localStorage.setItem(key, JSON.stringify(value));
		},
		getData: function(key) {
			return $window.localStorage && JSON.parse($window.localStorage.getItem(key));
		},
		clearData: function() {
			$window.localStorage.clear();
		}
	}

});