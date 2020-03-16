const mongoose = require("mongoose");

const columnValueSchema = new mongoose.Schema({
	columnType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Column_type",
		required: true
	},
	value: {
		type: String,
		default: ""
	}
});

const Column_value = mongoose.model("Column_value", columnValueSchema);

const taskSchema = new mongoose.Schema({
	name: {
		type: String,
		default: "Task Name",
		minlength: 2,
		maxlength: 25
	},
	column_values: [columnValueSchema]
});

const Task = mongoose.model("Task", taskSchema);

// TODO: Add validatioin functions

exports.Column_value = Column_value;
exports.Task = Task;
