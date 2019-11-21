const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const { Company } = require("./company");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 35
	},
	email: {
		type: String,
		required: true,
		minlength: 8,
		maxlength: 255,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		maxlength: 1024
	},
	company: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Company"
	},
	role: {
		type: String,
		enum: ["member", "admin", "supervisor"],
		required: true,
		default: "member"
	}
});

userSchema.methods.generateAuthToken = function() {
	const token = jwt.sign(
		{
			_id: this._id,
			name: this.name,
			email: this.email,
			company: this.company,
			role: this.role
		},
		config.get("jwtPrivateKey")
	);
	return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
	const schema = {
		name: Joi.string()
			.min(2)
			.max(35)
			.required(),
		email: Joi.string()
			.min(8)
			.max(255)
			.required()
			.email(),
		password: Joi.string()
			.min(6)
			.max(255)
			.required(),
		company: Joi.object().required()
	};

	return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
