const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
	role: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 35
	}
});

const Role = mongoose.model("Role", roleSchema);

exports.Role = Role;
