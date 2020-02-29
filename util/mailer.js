const config = require("config");
const winston = require("winston");
const nodemailer = require("nodemailer");

function sendMail(emailReceiver, company, link) {
	const emailbody = `
		<P><a href="${link}">Click to join ${company}</a></P>
	`;

	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: config.get("emailUser"),
			pass: config.get("emailPassword")
		}
	});

	let mailOptions = {
		from: `Plandy <${config.get("emailUser")}>`,
		to: emailReceiver,
		subject: `Invitation to join the ${company} account on Plandy🎉`,
		html: emailbody
	};

	transporter.sendMail(mailOptions, (err, data) => {
		if (err) {
			return winston.error(err);
		}
		return winston.info("Message sent: %s", data.messageId);
	});
}

exports.sendMail = sendMail;
