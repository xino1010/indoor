app.factory('users', function() {
	var users = {};
	return {
		setUsers: function (users) {
			for (var i = 0; i < users.length; i++) {
				this.updateUser(users[i]);
			}
		},
		removeUsers: function () {
			for (var userId in users) {
				delete users[userId];
			}
		},
		updateUser: function (user) {
			users[user._id] = user;
		},
		getUsers: function () {
			return users;
		}
	};
});