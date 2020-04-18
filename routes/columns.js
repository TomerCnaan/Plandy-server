const _ = require("lodash");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
	Board_column,
	validateReorder,
	validateAdd,
	validateName,
	validateDelete,
} = require("../models/boardColumn");
const { Board } = require("../models/board");

const { Column_type } = require("../models/columnType");

// Add column to a board
router.post("/", auth, async (req, res) => {
	const { error } = validateAdd(req.body);
	if (error) res.status(400).send(error.details[0].message);

	const { boardId, columnId } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	const permittedUsers = board.permitted_users.map((user) => String(user));
	if (!permittedUsers.includes(req.user._id))
		return res.status(403).send("You don't have a permission to add a column");

	const column = await Column_type.findById(columnId);
	if (!column) return res.status(400).send("Invalid column id.");

	const name = column.type;
	let newBoardColumn = new Board_column({
		name,
		columnType: column._id,
	});
	await newBoardColumn.save();

	const columnOrder = board.column_order.map((id) => String(id));
	columnOrder.push(newBoardColumn._id);
	board.column_order = columnOrder;
	await board.save();

	return res.send(newBoardColumn);
});

// update board column name
router.put("/", auth, async (req, res) => {
	const { error } = validateName(req.body);
	if (error) res.status(400).send(error.details[0].message);

	const { boardId, boardColumnId, newName } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	const permittedUsers = board.permitted_users.map((user) => String(user));
	if (!permittedUsers.includes(req.user._id))
		return res
			.status(403)
			.send("You don't have a permission to change the column name");

	const columnOrder = board.column_order.map((cul) => String(cul));
	if (!columnOrder.includes(boardColumnId))
		return res.status(400).send("Invalid board column id");

	const updatedColumn = await Board_column.findByIdAndUpdate(
		boardColumnId,
		{ name: newName },
		{ new: true, useFindAndModify: false }
	);

	return res.send(updatedColumn);
});

// delete board column
router.delete("/", auth, async (req, res) => {
	const { error } = validateDelete(req.body);
	if (error) res.status(400).send(error.details[0].message);

	const { boardId, boardColumnId } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	const permittedUsers = board.permitted_users.map((user) => String(user));
	if (!permittedUsers.includes(req.user._id))
		return res
			.status(403)
			.send("You don't have a permission to delete a column");

	const columnOrder = board.column_order.map((cul) => String(cul));
	if (!columnOrder.includes(boardColumnId))
		return res.status(400).send("Invalid board column id");

	const deletedColumn = await Board_column.findByIdAndRemove(boardColumnId, {
		useFindAndModify: false,
	});

	_.pull(columnOrder, boardColumnId); //remove id from column_order list

	board.column_order = columnOrder;
	await board.save();

	return res.send(deletedColumn);
});

// reorder columns of a board
router.put("/reorder", auth, async (req, res) => {
	const { boardId, columnsArray } = req.body;

	const { error } = validateReorder(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You don't have a permission to change the columns order.");

	const boardColumns = board.column_order.map((column) => String(column));
	if (!_.isEqual(_.sortBy(columnsArray), _.sortBy(boardColumns)))
		return res
			.status(400)
			.send("Invalid columns array - missing columns / invalid columns id's");

	board.column_order = columnsArray;
	const updatedBoard = await board.save();
	res.send(updatedBoard);
});

module.exports = router;
