const Joi = require("joi");
const mongoose = require("mongoose");

const boardColumnSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	columnType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Column_type"
	},
	customOptions: [String]
});
// TODO: add validation with Joi. test.

const Board_column = mongoose.model("Board_column", boardColumnSchema);

exports.Board_column = Board_column;
