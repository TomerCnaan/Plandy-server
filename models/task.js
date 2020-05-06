const Joi = require("joi");
const mongoose = require("mongoose");

const columnValueSchema = new mongoose.Schema({
	columnType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Column_type",
		required: true,
	},
	boardColumn: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Board_column",
		required: true,
	},
	value: {
		type: mongoose.Schema.Types.Mixed,
		default: "",
	},
});

const Column_value = mongoose.model("Column_value", columnValueSchema);

const taskSchema = new mongoose.Schema({
	name: {
		type: String,
		default: "Task Name",
		minlength: 2,
		maxlength: 50,
	},
	column_values: [columnValueSchema],
});

const Task = mongoose.model("Task", taskSchema);

/*
	validation
 */

// validate task add
function validateNew(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

// validate delete task
function validateDelete(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupId: Joi.objectId().required(),
		taskId: Joi.objectId().required(),
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

function validateName(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		groupId: Joi.objectId().required(),
		taskId: Joi.objectId().required(),
		name: Joi.string().min(2).max(50).required(),
	};

	return Joi.validate(req, schema);
}

exports.validateName = validateName;
exports.validateNew = validateNew;
exports.validateDelete = validateDelete;
exports.validateReorder = validateReorder;
exports.validateOuterReorder = validateOuterReorder;
exports.Column_value = Column_value;
exports.Task = Task;
