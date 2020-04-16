const Joi = require("joi");
const mongoose = require("mongoose");

const boardColumnSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	columnType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Column_type",
	},
	customOptions: [String],
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
		columnType: Joi.objectId().required(),
	};
}

exports.validateAdd = validateAdd;
exports.validateReorder = validateReorder;
exports.Board_column = Board_column;
