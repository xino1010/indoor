var gcm = require('node-gcm');

function FCM() {

}

FCM.prototype = {
	sendMessage: function() {
		var message = new gcm.Message({
			priority: 'high',
			data: {},
			notification: {
				title: "Hello, World",
				icon: "ic_launcher",
				body: "This is a notification that will be displayed if your app is in the background."
			}
		});

		message.addData({
			key1: 'message1',
			key2: 'message2'
		});

		// Set up the sender with you API key
		var sender = new gcm.Sender('AIzaSyAPMKUZ9LuUVaWs0yeZNyOrRe7uGKYsOg8');

		// Add the registration tokens of the devices you want to send to
		var registrationTokens = [];
		registrationTokens.push('dbFzIKuaR8s:APA91bGBKvxhw3A5xpaoHTNSd_ikLMrtggeT0NS16JUvphsTBIbmH0LEMcZtEwrrvnjyiiDAc-WRLP4bA3HCGjTgS9brwUGIgRR7CwlfiSQiUyr8DnC6epbUx5eqcUdJGRMyusbJh-6w');

		sender.send(message, {
			registrationTokens: registrationTokens
		}, function (err, response) {
			if (err) {
				log.error('Error sending fcm notification: ' + err);
			}
			else {
				log.info('FCM notification sent successfully: ' + JSON.stringify(response));
			}
		});
	}
}

module.exports = FCM;