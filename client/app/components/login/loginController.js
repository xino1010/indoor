app.controller('loginController', function($scope, $location, auth, socket) {
	$scope.username = "";
	$scope.password = "";
	$scope.errorOnLoggin = false;
	$scope.errorLogginMessage = "";

	$scope.login = function () {
		if ($scope.username != "" && $scope.passowrd != "") {
			auth.api().login({
				username: $scope.username,
				password: $scope.password,
			}, function (result) {
				if (result.code == 1) {
					auth.setUser(result.user);
					auth.setToken(result.token);
					socket.connect();
					$location.path('/');
				}
				else {
					$scope.errorOnLoggin = true;
					$scope.errorLogginMessage = result.message;
				}
			});
		}
	};
});