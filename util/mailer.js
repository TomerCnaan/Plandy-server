const config = require("config");
const winston = require("winston");
const nodemailer = require("nodemailer");

function sendMail(emailReceiver, company, link) {
	const emailbody = `
		<P><a href="${link}">Click to join ${company}</a></P>
	`;

	let transporter = nodemailer.createTransport({
		// service: "gmail",
		host: "in-v3.mailjet.com",
		port: 587,
		secure: false,
		// auth: {
		// 	user: config.get("emailUser"),
		// 	pass: config.get("emailPassword")
		// }

		// TODO: store in env vars
		auth: {
			user: "bac0b40eddf516fa3c886b61661de614",
			pass: "f09fbaa5aad6b4d9972eb24ec86d872a",
		},
	});

	let mailOptions = {
		from: `Plandy <${config.get("emailUser")}>`,
		to: emailReceiver,
		subject: `Invitation to join the ${company} account on Plandy🥳`,
		html: emailbody,
	};

	transporter.verify(function (error, success) {
		if (error) {
			console.log(error);
		} else {
			console.log("Server is ready to take our messages");
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
