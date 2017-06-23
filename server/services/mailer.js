var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

module.exports = {
	sendEmail: function(receivers, subject, text) {
		var mailOptions = {
		    from: '"Arduino" <' + process.env.MAIL_USER + '>',
		    to: receivers.join(','), 
		    subject: subject,
		    text: text,
		};
		transporter.sendMail(mailOptions, function (error, info) {
		    if (error) {
		    	log.error('Error send email ("' + subject + '"):' + error);
		    }
		    else {
			    log.info('Message %s sent: %s', info.messageId, info.response);
		    }
		});
	}
};