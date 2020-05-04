const Joi = require("joi");

// validate new text value
function validateNewText(req) {
	const schema = {
		boardId: Joi.objectId().required(),
		taskId: Joi.objectId().required(),
		value: Joi.string().allow("").required(),
		boardColumnId: Joi.objectId().required(),
	};

	return Joi.validate(req, schema);
}

exports.validateNewText = validateNewText;
