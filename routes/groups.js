const _ = require("lodash");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const { Group, validateReorder } = require("../models/group");
const { Board } = require("../models/board");

// reorder the groups of a board.
router.put("/reorder", auth, async (req, res) => {
	const { boardId, groupsArray } = req.body;

	const { error } = validateReorder(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let board = await Board.findById(boardId);

	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You don't have a permission to change the groups order.");

	const boardGroups = board.groups.map(group => String(group));
	if (!_.isEqual(_.sortBy(groupsArray), _.sortBy(boardGroups)))
		return res
			.status(400)
			.send("Invalid gorups array - missing groups / invalid groups id's");

	board.groups = groupsArray;
	const updatedBoard = await board.save();
	res.send(updatedBoard);
});

module.exports = router;
