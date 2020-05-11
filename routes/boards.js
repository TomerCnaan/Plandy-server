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
	validateAddUsers,
	validateGetUsers,
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
		.select({ name: 1, description: 1, owner: 1 });

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
router.get("/:id", [auth], async (req, res) => {
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
router.delete("/:id", [auth, admin], async (req, res) => {
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
router.put("/type", [auth, admin], async (req, res) => {
	const { type, boardId } = req.body;

	const { error } = validateType(req.body);
	if (error) res.status(400).send(error.details[0].message);

	let board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You have no permission to change the board type.");

	if (String(board.type) !== "public" && type === "public") {
		// add all company users to the board if type converted to public.
		const userInBoard = board.permitted_users.concat(board.read_only_users);
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
router.put("/description", [auth, admin], async (req, res) => {
	const { error } = validateDescription(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId, description } = req.body;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You have no permission to change the board description.");

	board.description = description;
	board.save();

	return res.send(description);
});

// get users of a spesific board
router.get("/users/:boardId", auth, async (req, res) => {
	const { error } = validateGetUsers(req.params);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId } = req.params;

	const board = await Board.findOne({ _id: boardId })
		.populate("owner")
		.populate("permitted_users")
		.populate("read_only_users");
	if (!board) return res.status(400).send("Invalid board id.");

	let usersInBoard = board.permitted_users.concat(board.read_only_users);
	usersInBoard = usersInBoard.map((user) => user._id);
	if (!usersInBoard.includes(req.user._id))
		return res.status(400).send("The user doesn't exist in this board.");

	const permitted = board.permitted_users.filter(
		(user) => String(user._id) !== String(board.owner._id)
	);

	const data = {
		owner: board.owner.name,
		permitted,
		readOnly: board.read_only_users,
	};

	res.send(data);
});

// get all the users from the company that are not in the given board
router.get("/other-users/:boardId", [auth, admin], async (req, res) => {
	const { error } = validateGetUsers(req.params);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId } = req.params;

	const board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You have no permission to add users to the board.");

	const usersInBoard = board.permitted_users.concat(board.read_only_users);

	const usersNotInBoard = await User.find({
		_id: { $nin: usersInBoard },
		company: board.company,
	}).select("name");

	res.send(usersNotInBoard);
});

// add users to a board
router.post("/add-users", [auth, admin], async (req, res) => {
	const { error } = validateAddUsers(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { boardId, users: newUsers, permitted } = req.body;

	let board = await Board.findById(boardId);
	if (!board) return res.status(400).send("Invalid board id.");

	if (String(board.owner) !== req.user._id)
		return res
			.status(403)
			.send("You have no permission to add users to the board.");

	if (String(board.type) === "public")
		return res
			.status(400)
			.send("The board is public - all the users can already see it.");

	const usersInBoard = board.permitted_users.concat(board.read_only_users);

	for (const userId of newUsers) {
		if (usersInBoard.includes(userId))
			return res
				.status(400)
				.send("One of the users already exists in this board.");

		const user = await User.findOne({ _id: userId, company: board.company });
		if (!user) return res.status(400).send("One or more invalid user id's");
	}

	if (permitted) {
		board.permitted_users.push(newUsers);
	} else board.read_only_users.push(newUsers);

	board = await board.save();
	res.send(board);
});

//TODO: delete a user from the board

module.exports = router;
