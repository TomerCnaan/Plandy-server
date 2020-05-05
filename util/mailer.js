const config = require("config");
const winston = require("winston");
const nodemailer = require("nodemailer");

function sendMail(emailReceiver, company, link) {
	const emailbody = `
		<P><a href="${link}">Click to join ${company}</a></P>
	`;

	let transporter = nodemailer.createTransport({
		host: "in-v3.mailjet.com",
		port: 587,
		secure: false,
		auth: {
			user: config.get("emailTransporter"),
			pass: config.get("emailPassword"),
		},
	});

	let mailOptions = {
		from: `Plandy <${config.get("emailUser")}>`,
		to: emailReceiver,
		subject: `Invitation to join the ${company} account on Plandy🥳`,
		html: emailbody,
	};

	transporter.verify(function (err, success) {
		if (err) {
			winston.error(err);
		} else {
			winston.info("Server is ready to take our messages");
		}
	});

	transporter.sendMail(mailOptions, (err, data) => {
		console.log(data);
		if (err) {
			return winston.error(err);
		}
		return winston.info("Message sent: %s", data.messageId);
	});
}

exports.sendMail = sendMail;
