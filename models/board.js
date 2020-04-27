const Joi = require("joi");
const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 25,
	},
	description: {
		type: String,
		default: "Board description",
		maxlength: 100,
	},
	type: {
		type: String,
		enum: ["public", "private"],
		required: true,
	},
	company: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Company",
	},
	groups: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
		},
	],
	column_order: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Board_column",
		},
	],
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	read_only_users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	permitted_users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
});

const Board = mongoose.model("Board", boardSchema);

// TODO: add validation function for posting a board, updating, getting, deleting

// Validation for adding a new board
function validateBoard(board) {
	const schema = {
		name: Joi.string().min(2).max(20).required(),
		type: Joi.string().valid("public", "private").required(),
	};

	return Joi.validate(board, schema);
}

// Validation for deleting a board (checks if valid objectId)
function validateDelete(params) {
	const schema = {
		id: Joi.objectId().required(),
	};

	return Joi.validate(params, schema);
}

// validation for chaning the type of the board
function validateType(req) {
	const schema = {
		type: Joi.string().valid("private", "public").required(),
		boardId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

function validateDescription(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		description: Joi.string().required().max(100),
	};

	return Joi.validate(req, schema);
}

function validateAddUsers(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		users: Joi.array().items(Joi.objectId().required()).unique().required(),
		permitted: Joi.bool().required(),
	};

	return Joi.validate(req, schema);
}

exports.validateAddUsers = validateAddUsers;
exports.validateDescription = validateDescription;
exports.validateType = validateType;
exports.validateDelete = validateDelete;
exports.validateBoard = validateBoard;
exports.Board = Board;
