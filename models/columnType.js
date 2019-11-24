const mongoose = require("mongoose");

const columnTypeSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true
	},
	options: [String]
});

const Column_type = mongoose.model("Column_type", columnTypeSchema);

exports.Column_type = Column_type;
