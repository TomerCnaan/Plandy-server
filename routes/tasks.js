const _ = require("lodash");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const { Task, validateReorder } = require("../models/task");
const { Group } = require("../models/group");
const { Board } = require("../models/board");

// TODO: test this route
// reorder the tasks inside a group
router.put("/reorder", auth, async (req, res) => {
	const { boardId, groupId, tasksArray } = req.body;

	const { error } = validateReorder(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You don't have a permission to change the groups order.");

	let group = await Group.findById(groupId);
	if (!group) return res.status(400).send("Invalid group id.");

	const groupTasks = group.tasks.map((task) => String(task));
	if (!_.isEqual(_.sortBy(tasksArray), _.sortBy(groupTasks)))
		return res
			.status(400)
			.send("Invalid tasks array - missing tasks / invalid tasks id's");

	group.tasks = tasksArray;
	const updatedGroup = await group.save();
	res.send(updatedGroup);
});

module.exports = router;
