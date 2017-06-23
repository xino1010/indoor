app.config(function($routeProvider) {
    $routeProvider
    	.when("/", {
    		controller: "mainController",
    		templateUrl: "app/components/main/mainView.html"
    	})
        .when("/login", {
            controller: "loginController",
            templateUrl : "app/components/login/loginView.html",
        })
        .otherwise({
        	redirectTo: '/'
        });
}).run(function($location, auth, socket) {
	if (!auth.userIsLogged() || !socket.isConnected())
		$location.path('/login');
});