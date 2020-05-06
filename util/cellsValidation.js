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

// validate new / update priority value
function validateNewPriority(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		taskId: Joi.objectId().required(),
		value: Joi.string().required(),
		boardColumnId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

exports.validateNewText = validateNewText;
exports.validateNewLink = validateNewLink;
exports.validateNewPriority = validateNewPriority;
