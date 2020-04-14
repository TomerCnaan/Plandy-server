const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
	Board,
	validateBoard,
	validateDelete,
	validateType,
	validateDescription,
} = require("../models/board");
const { User } = require("../models/user");
const { Group } = require("../models/group");
const { Task } = require("../models/task");
const { Board_column } = require("../models/boardColumn");
const { Column_type } = require("../models/columnType");

/*
	getting board names(this route is not for the full baord data)
	gets all boards that are visible for the requesting user
*/
router.get("/", auth, async (req, res) => {
	const userId = new mongoose.Types.ObjectId(req.user._id);
	const companyId = new mongoose.Types.ObjectId(req.user.company);

	// Query
	const compnayBoards = await Board.find({
		company: companyId,
	})
		.or([
			{ read_only_users: { $eq: userId } },
			{ permitted_users: { $eq: userId } },
		])
		.sort({ name: 1 })
		.select({ name: 1, description: 1 });

	return res.send(compnayBoards); //Array of board names and id's
});

/*
	create a new board. Must be autenticated and an admin.
*/
router.post("/", [auth, admin], async (req, res) => {
	const { error } = validateBoard(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	// check if the board name exists in the user's company
	let companyId = req.user.company;
	companyId = new mongoose.Types.ObjectId(companyId);
	let board = await Board.findOne({ name: req.body.name, company: companyId });
	if (board)
		return res.status(400).send("The board name has already been taken.");

	let board_users = [];
	if (req.body.type === "public") {
		board_users = await User.find({
			_id: { $ne: req.user._id },
			company: companyId,
		}).select("_id");
		board_users = board_users.map(
			(user) => new mongoose.Types.ObjectId(user._id)
		);
	}

	board = new Board({
		name: req.body.name,
		type: req.body.type,
		company: companyId,
		gorups: [],
		column_order: [],
		owner: new mongoose.Types.ObjectId(req.user._id),
		read_only_users: board_users,
		permitted_users: [new mongoose.Types.ObjectId(req.user._id)],
	});

	await board.save();

	res.send(_.pick(board, ["_id", "name", "description"]));
});

/*
	get board data for a specific board
*/
router.get("/:id", auth, async (req, res) => {
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
		return res.status(400).send("Invalid board id");

	const board = await Board.findOne({
		_id: req.params.id,
		company: new mongoose.Types.ObjectId(req.user.company),
	})
		.populate({
			path: "groups",
			populate: {
				path: "tasks",
				model: Task,
				populate: {
					path: "column_values.columnType",
					model: Column_type,
				},
			},
		})
		.populate({ path: "column_order", populate: { path: "columnType" } })
		.select({
			name: 1,
			groups: 1,
			column_order: 1,
			description: 1,
			owner: 1,
			permitted_users: 1,
			type: 1,
		});

	let permitted = false;
	if (board.permitted_users.includes(req.user._id)) permitted = true;

	const boardObj = board.toObject();
	delete boardObj.permitted_users;
	boardObj.isPermitted = permitted;

	res.send(boardObj);
});

/*
	Delete a board by id.
*/
router.delete("/:id", auth, async (req, res) => {
	const id = req.params.id;

	const { error } = validateDelete(req.params);
	if (error) return res.status(400).send(error.details[0].message);

	const board = await Board.findByIdAndRemove(id, { useFindAndModify: false });
	if (!board) return res.status(400).send("Invalid board id.");

	res.send(board);
});

// TODO: update board routes - change type, description, make user permitted or read-only.

/*
	Change the type of a board
 */
router.put("/type", auth, async (req, res) => {
	const { type, boardId } = req.body;

	const { error } = validateType(req.body);
	if (error) res.status(400).send(error.details[0].message);

	let board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You have no permission to change to board type.");

	if (String(board.type) !== "public" && type === "public") {
		// add all company users to the board if type converted to public.
		const userInBoard = board.permitted_users.concat(board.read_only_users);
		console.log(userInBoard);
		let usersToAdd = await User.find({ company: board.company })
			.where("_id")
			.nin(userInBoard)
			.select("_id");
		usersToAdd = usersToAdd.map((user) => user._id);
		await Board.update(
			{ _id: boardId },
			{ $push: { read_only_users: { $each: usersToAdd } } }
		);
	}

	board.type = type;
	await board.save();
	res.send(_.pick(board, ["type", "_id"]));
});

/*
	update board description
 */
router.put("/description", auth, async (req, res) => {
	const { error } = validateDescription(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId, description } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You have no permission to change to board type.");

	board.description = description;
	board.save();

	return res.send(description);
});

// TODO: post - add users to a private board.

module.exports = router;
