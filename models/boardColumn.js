const Joi = require("joi");
const mongoose = require("mongoose");

const customOptionsSchema = new mongoose.Schema({
	value: {
		type: String,
	},
	color: {
		type: String,
	},
});

const CustomOption = mongoose.model("CustomOption", customOptionsSchema);

const boardColumnSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 20,
	},
	columnType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Column_type",
		required: true,
	},
	customOptions: [customOptionsSchema],
});

boardColumnSchema.post("save", function (doc, next) {
	doc
		.populate("columnType")
		.execPopulate()
		.then(function () {
			next();
		});
});

const Board_column = mongoose.model("Board_column", boardColumnSchema);

// Validate reorder of groups in a specific board
function validateReorder(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		columnsArray: Joi.array().items(Joi.string()).required(),
	};

	return Joi.validate(req, schema);
}

// Validate add column to a board
function validateAdd(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		columnId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

// validate update name
function validateName(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		boardColumnId: Joi.objectId().required(),
		newName: Joi.string().required().min(2).max(12),
	};

	return Joi.validate(req, schema);
}

// validate delete column
function validateDelete(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		boardColumnId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

exports.validateDelete = validateDelete;
exports.validateName = validateName;
exports.validateAdd = validateAdd;
exports.validateReorder = validateReorder;
exports.CustomOption = CustomOption;
exports.Board_column = Board_column;
