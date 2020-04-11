const Joi = require("joi");
const mongoose = require("mongoose");

const columnValueSchema = new mongoose.Schema({
	columnType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Column_type",
		required: true,
	},
	value: {
		type: String,
		default: "",
	},
});

const Column_value = mongoose.model("Column_value", columnValueSchema);

const taskSchema = new mongoose.Schema({
	name: {
		type: String,
		default: "Task Name",
		minlength: 2,
		maxlength: 25,
	},
	column_values: [columnValueSchema],
});

const Task = mongoose.model("Task", taskSchema);

// TODO: Add validatioin functions

function validateNew(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

// Validate reorder of a task inside a specific group
function validateReorder(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupId: Joi.objectId().required(),
		tasksArray: Joi.array().items(Joi.string()).required(),
	};

	return Joi.validate(req, schema);
}

// Validate reorder of a task that moved to a different group
function validateOuterReorder(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		sourceGroupId: Joi.objectId().required(),
		destinationGroupId: Joi.objectId().required(),
		taskIdToMove: Joi.objectId().required(),
		newIndex: Joi.number().required(),
	};

	return Joi.validate(req, schema);
}

exports.validateNew = validateNew;
exports.validateReorder = validateReorder;
exports.validateOuterReorder = validateOuterReorder;
exports.Column_value = Column_value;
exports.Task = Task;
