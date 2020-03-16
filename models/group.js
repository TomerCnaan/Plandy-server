const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
	title: {
		type: String,
		default: "Title",
		minlength: 2,
		maxlength: 25
	},
	color: {
		type: String
	},
	tasks: [] //TODO: complete after adding the task model
});

const Group = mongoose.model("Group", groupSchema);

//TODO: Add validation functions

exports.Group = Group;
