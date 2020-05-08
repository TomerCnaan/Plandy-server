const Joi = require("joi");
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 35,
		},
		max_users: {
			type: Number,
			required: true,
			default: 100,
		},
	},
	{ timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

function validateCompany(company) {
	const schema = {
		name: Joi.string().min(3).max(35).required(),
	};

	return Joi.validate(company, schema);
}

function validateGetInfo(req) {
	const schema = {
		companyId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

exports.Company = Company;
exports.validate = validateCompany;
exports.validateGetInfo = validateGetInfo;
