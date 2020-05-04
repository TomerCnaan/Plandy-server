const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const { Board } = require("../models/board");
const { Task, Column_value } = require("../models/task");
const { Board_column } = require("../models/boardColumn");

const auth = require("../middleware/auth");
const { validateNewText } = require("../util/cellsValidation");

//new text cell
router.post("/text", auth, async (req, res) => {
	const { error } = validateNewText(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId, taskId, value, boardColumnId } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board Id.");

	const permittedUsers = board.permitted_users.map((id) => String(id));
	if (!permittedUsers.includes(req.user._id))
		return res.status(403).send("You don't have a permission to edit cells.");

	const columnOrder = board.column_order.map((id) => String(id));
	if (!columnOrder.includes(boardColumnId))
		return res.status(400).send("Invalid board column Id.");

	const task = await Task.findById(taskId);
	if (!task) return res.status(400).send("Invalid task Id.");

	const column = await Board_column.findById(boardColumnId).populate(
		"columnType"
	);
	if (column.columnType.type !== "text")
		return res.status(400).send("invalid board column type");

	const cell = task.column_values.find(
		(x) => String(x.boardColumn) === boardColumnId
	);
	if (!cell) {
		// create new cell
		const columnType = column.columnType._id;

		const newCell = new Column_value({
			columnType,
			boardColumn: boardColumnId,
			value,
		});

		task.column_values.push(newCell);
		const newTask = await task.save();
		return res.send(newTask);
	}

	// update current cell
	cell.value = value;
	const updatedTask = await task.save();

	res.send(_.pick(updatedTask, ["_id", "name", "column_values"]));
});

module.exports = router;
