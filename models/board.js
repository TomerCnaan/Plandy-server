const Joi = require("joi");
const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 25
	},
	description: {
		type: String,
		default: "Board description",
		maxlength: 100
	},
	company: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Company"
	},
	groups: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group"
		}
	],
	column_order: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Board_column"
		}
	],
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	read_only_users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
	permitted_users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	]
});

const Board = mongoose.model("Board", boardSchema);

// TODO: add validation function for posting a board, updating, getting, deleting

// Validation for adding a new board
function validateBoard(board) {
	const schema = {
		name: Joi.string()
			.min(2)
			.max(20)
			.required(),
		type: Joi.string()
			.valid("public", "private")
			.required()
	};

	return Joi.validate(board, schema);
}

// function updateBoardStrings(param) {
//     if (param.name)

// }

exports.Board = Board;
exports.validateBoard = validateBoard;
