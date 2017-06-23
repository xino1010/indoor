app.factory('auth', function($resource, $location, localstorage) {

	api = function() {
		return $resource('/auth/login', {
			username: '@username',
			password: '@password'
		}, {
			login: {
				method: 'POST'
			}
		});
	};

	return {
		api: api,
		getUser: function () {
			return localstorage.getData('user');
		},
		setUser: function(user) {
			localstorage.setData('user', user);
		},
		getToken: function() {
			return localstorage.getData('token');
		},
		setToken: function(token) {
			localstorage.setData('token', token);
		},
		userIsLogged: function() {
			var user = this.getUser();
			return (user != null) && (typeof user != undefined);
		},
		closeSession: function () {
			delete $sessionStorage;
		}
	}
});