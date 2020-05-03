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
		maxlength: 35,
	},
	email: {
		type: String,
		required: true,
		minlength: 8,
		maxlength: 255,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
		maxlength: 1024,
	},
	company: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Company",
		required: true,
	},
	role: {
		type: String,
		enum: ["member", "admin", "supervisor"],
		required: true,
		default: "member",
	},
});

userSchema.methods.generateAuthToken = function () {
	// set authentication token data
	const token = jwt.sign(
		{
			_id: this._id,
			name: this.name,
			email: this.email,
			company: this.company,
			role: this.role,
		},
		config.get("jwtPrivateKey") // encrypt with private string(saved to environment variable)
	);
	return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
	const schema = {
		name: Joi.string().min(2).max(35).required(),
		email: Joi.string().min(8).max(255).required().email(),
		password: Joi.string().min(6).max(255).required(),
		company: Joi.object().required(),
	};

	return Joi.validate(user, schema);
}

function validateExistingUser(user) {
	const schema = {
		name: Joi.string().min(2).max(35).required(),
	};

	return Joi.validate(user, schema);
}

// validate change role
function validateRoleChange(req) {
	const schema = {
		userId: Joi.objectId().required(),
		newRole: Joi.string().valid("admin", "member", "supervisor").required(),
	};

	return Joi.validate(req, schema);
}

exports.User = User;
exports.validate = validateUser;
exports.validateExisting = validateExistingUser;
exports.validateRoleChange = validateRoleChange;
