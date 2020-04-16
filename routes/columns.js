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
} = require("../models/boardColumn");
const { Board } = require("../models/board");

// Add column to a board
router.get("/", auth, async (req, res) => {
	const { error } = validateAdd(req.body);
	if (error) res.status(400).send(error.details[0].message);
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
