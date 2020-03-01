const Joi = require("joi");
const mongoose = require("mongoose");

const { Company } = require("./company");

const emailTokenSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true
	},
	company: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Company"
	}
});

const Email_token = mongoose.model("Email_token", emailTokenSchema);

function validateEmail(email) {
	const schema = {
		email: Joi.string()
			.email()
			.required()
	};

	return Joi.validate(email, schema);
}

exports.Email_token = Email_token;
exports.validate = validateEmail;
