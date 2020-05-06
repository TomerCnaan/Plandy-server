const mongoose = require("mongoose");

const columnOptionsSchema = new mongoose.Schema({
	value: { type: String },
	color: { type: String },
});

const columnTypeSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
	},
	options: [columnOptionsSchema],
});

const Column_type = mongoose.model("Column_type", columnTypeSchema);

exports.Column_type = Column_type;
