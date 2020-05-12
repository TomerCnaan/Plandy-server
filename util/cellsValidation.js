const Joi = require("joi");

// validate new / update text value
function validateNewText(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		taskId: Joi.objectId().required(),
		value: Joi.string().allow("").required(),
		boardColumnId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

// validate new / update link value
function validateNewLink(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		taskId: Joi.objectId().required(),
		value: Joi.string().uri().required(),
		boardColumnId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

function validateNewNumber(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		taskId: Joi.objectId().required(),
		value: Joi.number().allow("").required(),
		boardColumnId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

// validate new / update priority/status value
function validateNewPriority(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		taskId: Joi.objectId().required(),
		value: Joi.string().required(),
		boardColumnId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

// validate new / update date value
function validateNewDate(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		taskId: Joi.objectId().required(),
		value: Joi.date().allow("").required(),
		boardColumnId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

exports.validateNewText = validateNewText;
exports.validateNewLink = validateNewLink;
exports.validateNewNumber = validateNewNumber;
exports.validateNewPriority = validateNewPriority;
exports.validateNewDate = validateNewDate;
