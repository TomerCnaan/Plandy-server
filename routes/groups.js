const _ = require("lodash");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
	Group,
	validateReorder,
	validateNew,
	validateDelete,
	validateTitle,
} = require("../models/group");
const { Board } = require("../models/board");

// add new group to a board
router.post("/", auth, async (req, res) => {
	const { error } = validateNew(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	const newGroup = new Group();
	newGroup.save();

	const boardGroups = board.groups.map((group) => String(group));
	boardGroups.push(newGroup._id);
	board.groups = boardGroups;
	board.save();

	return res.send(newGroup);
});

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

	const boardGroups = board.groups.map((group) => String(group));
	if (!_.isEqual(_.sortBy(groupsArray), _.sortBy(boardGroups)))
		return res
			.status(400)
			.send("Invalid gorups array - missing groups / invalid groups id's");

	board.groups = groupsArray;
	const updatedBoard = await board.save();
	res.send(updatedBoard);
});

// delete a group from a board
router.delete("/", auth, async (req, res) => {
	const { error } = validateDelete(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId, groupId } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res.status(403).send("You don't have a permission delete a group.");

	let boardGroups = board.groups.map((group) => String(group));
	if (!boardGroups.includes(groupId))
		return res.status(400).send("Invalid group id.");

	const deletedGroup = await Group.findByIdAndRemove(groupId, {
		useFindAndModify: false,
	});

	_.pull(boardGroups, groupId); //remove group id from groups list
	board.groups = boardGroups;
	await board.save();

	res.send(deletedGroup);
});

// update group title
router.put("/title", auth, async (req, res) => {
	const { error } = validateTitle(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId, groupId, title } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You don't have a permission to change the title.");

	let boardGroups = board.groups.map((group) => String(group));
	if (!boardGroups.includes(groupId))
		return res.status(400).send("Invalid group id.");

	const group = await Group.findByIdAndUpdate(
		groupId,
		{ title },
		{ new: true },
		{ useFindAndModify: false }
	);

	return res.send(group);
});

module.exports = router;
