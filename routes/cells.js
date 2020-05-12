const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const { Board } = require("../models/board");
const { Task, Column_value } = require("../models/task");
const { Board_column } = require("../models/boardColumn");

const {
	validateNewText,
	validateNewLink,
	validateNewNumber,
	validateNewPriority,
	validateNewDate,
} = require("../util/cellsValidation");
const auth = require("../middleware/auth");

//update or create text cell
router.post("/text", auth, async (req, res) => {
	const { error } = validateNewText(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	handleCellAssignment(req.user, req.body, "text", res);
});

// update or create link cell
router.post("/link", auth, async (req, res) => {
	const { error } = validateNewLink(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	handleCellAssignment(req.user, req.body, "link", res);
});

// update or create number cell
router.post("/number", auth, async (req, res) => {
	const { error } = validateNewNumber(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	handleCellAssignment(req.user, req.body, "number", res);
});

// update or create priority cell
router.post("/priority", auth, async (req, res) => {
	const { error } = validateNewPriority(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const priorityColumn = await Board_column.findById(
		req.body.boardColumnId
	).populate("columnType");
	if (!priorityColumn) return res.status(400).send("Invalid board column Id.");

	const options = priorityColumn.columnType.options.map((option) =>
		String(option.value)
	);
	const customOptions = priorityColumn.customOptions.map((option) =>
		String(option.value)
	);
	if (![...options, ...customOptions].includes(req.body.value))
		return res.status(400).send("Invalid value property.");

	handleCellAssignment(req.user, req.body, "priority", res);
});

// update or create status cell
router.post("/status", auth, async (req, res) => {
	const { error } = validateNewPriority(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const statusColumn = await Board_column.findById(
		req.body.boardColumnId
	).populate("columnType");
	if (!statusColumn) return res.status(400).send("Invalid board column Id.");

	const options = statusColumn.columnType.options.map((option) =>
		String(option.value)
	);
	const customOptions = statusColumn.customOptions.map((option) =>
		String(option.value)
	);
	if (![...options, ...customOptions].includes(req.body.value))
		return res.status(400).send("Invalid value property.");

	handleCellAssignment(req.user, req.body, "status", res);
});

router.post("/date", auth, async (req, res) => {
	const { error } = validateNewDate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	handleCellAssignment(req.user, req.body, "due date", res);
});

// -------------------------------------

// reusable function for creatign and updating a cell with a string value
async function handleCellAssignment(user, params, sType, res) {
	const { boardId, taskId, value, boardColumnId } = params;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board Id.");

	const permittedUsers = board.permitted_users.map((id) => String(id));
	if (!permittedUsers.includes(user._id))
		return res.status(403).send("You don't have a permission to edit cells.");

	const columnOrder = board.column_order.map((id) => String(id));
	if (!columnOrder.includes(boardColumnId))
		return res.status(400).send("Invalid board column Id.");

	const task = await Task.findById(taskId);
	if (!task) return res.status(400).send("Invalid task Id.");

	const column = await Board_column.findById(boardColumnId).populate(
		"columnType"
	);
	if (column.columnType.type !== sType)
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
		return res.send(_.pick(newTask, ["_id", "name", "column_values"]));
	}

	// update current cell
	cell.value = value.toString();
	const updatedTask = await task.save();

	res.send(_.pick(updatedTask, ["_id", "name", "column_values"]));
}

module.exports = router;
