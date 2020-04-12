const _ = require("lodash");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
	Task,
	validateNew,
	validateDelete,
	validateReorder,
	validateOuterReorder,
} = require("../models/task");
const { Group } = require("../models/group");
const { Board } = require("../models/board");

// create a new task
router.post("/", auth, async (req, res) => {
	const { error } = validateNew(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId, groupId } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	const permittedUsers = board.permitted_users.map((id) => String(id));
	if (!permittedUsers.includes(req.user._id))
		return res
			.status(403)
			.send("You don't have a permission to change the groups order.");

	const group = await Group.findById(groupId);
	if (!group) return res.status(400).send("Invalid group id.");

	let newTask = new Task();
	newTask.save();

	const groupTasks = group.tasks.map((task) => String(task));
	groupTasks.push(newTask._id);
	group.tasks = groupTasks;
	group.save();

	return res.send(newTask);
});

// delete a task
router.delete("/", auth, async (req, res) => {
	const { error } = validateDelete(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId, groupId, taskId } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	const permitted = board.permitted_users.map((user) => String(user));
	if (!permitted.includes(req.user._id))
		return res
			.status(403)
			.send("You don't have a permission to delete a task.");

	let boardGroups = board.groups.map((group) => String(group));
	if (!boardGroups.includes(groupId))
		return res.status(400).send("Invalid group id.");

	const group = await Group.findById(groupId);
	const tasks = group.tasks.map((task) => String(task));
	if (!tasks.includes(taskId)) return res.status(400).send("Invalid task id.");

	const deletedTask = await Task.findByIdAndRemove(taskId, {
		useFindAndModify: false,
	});
	_.pull(tasks, taskId); //remove id from tasks list

	group.tasks = tasks;
	await group.save();

	res.send(deletedTask);
});

// TODO: test this route
// reorder the tasks inside a group
router.put("/reorder", auth, async (req, res) => {
	const { error } = validateReorder(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId, groupId, tasksArray } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You don't have a permission to change the tasks order.");

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

// TODO: test this route
// reorder tasks that were moved to a different group
router.put("/outer-reorder", auth, async (req, res) => {
	const { error } = validateOuterReorder(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const {
		boardId,
		sourceGroupId,
		destinationGroupId,
		taskIdToMove,
		newIndex,
	} = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You don't have a permission to change the tasks order.");

	if (sourceGroupId === destinationGroupId)
		return res.status(400).send("Group id's should be unique");

	let sourceGroup = await Group.findById(sourceGroupId);
	let destinationGroup = await Group.findById(destinationGroupId);
	if (!sourceGroup || !destinationGroup)
		return res.status(400).send("Invalid source / destination group id.");
	// sourceGroup = sourceGroup.toObject();
	// destinationGroup = destinationGroup.toObject();

	const sourceGroupTasks = sourceGroup.tasks.map((task) => String(task));
	if (!sourceGroupTasks.includes(taskIdToMove))
		return res.status(400).send("Invalid task id to move.");

	if (newIndex > destinationGroup.length)
		return res.status(400).send("Invalid destination index");

	const indexToMove = sourceGroupTasks.indexOf(taskIdToMove);
	sourceGroupTasks.splice(indexToMove, 1);
	let destinationGroupTasks = destinationGroup.tasks.map((task) =>
		String(task)
	);
	destinationGroupTasks = Array.from(destinationGroupTasks);
	destinationGroupTasks.splice(newIndex, 0, taskIdToMove);

	sourceGroup.tasks = sourceGroupTasks;
	await sourceGroup.save();

	destinationGroup.tasks = destinationGroupTasks;
	await destinationGroup.save();

	res.send(destinationGroup);
});

module.exports = router;
