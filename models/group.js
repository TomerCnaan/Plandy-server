const mongoose = require("mongoose");
const Joi = require("joi");

const groupSchema = new mongoose.Schema({
	title: {
		type: String,
		default: "Title",
		minlength: 2,
		maxlength: 25,
	},
	color: {
		type: String,
		default: "black",
	},
	tasks: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
		},
	],
});

const Group = mongoose.model("Group", groupSchema);

//TODO: Add validation functions

function validateNew(req) {
	const schema = {
		boardId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

// Delete group from a board
function validateDelete(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

// Validate reorder of groups in a specific board
function validateReorder(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupsArray: Joi.array().items(Joi.string()).required(),
	};

	return Joi.validate(req, schema);
}

function validateTitle(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupId: Joi.objectId().required(),
		title: Joi.string().required().max(25).min(2),
	};

	return Joi.validate(req, schema);
}

function validateColor(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupId: Joi.objectId().required(),
		color: Joi.string().required(),
	};

	return Joi.validate(req, schema);
}

exports.validateColor = validateColor;
exports.validateTitle = validateTitle;
exports.validateNew = validateNew;
exports.validateDelete = validateDelete;
exports.validateReorder = validateReorder;
exports.Group = Group;
