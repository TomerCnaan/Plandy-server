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

// Validate reorder of groups in a specific board
function validateReorder(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupsArray: Joi.array().items(Joi.string()).required(),
	};

	return Joi.validate(req, schema);
}

exports.validateNew = validateNew;
exports.validateReorder = validateReorder;
exports.Group = Group;
