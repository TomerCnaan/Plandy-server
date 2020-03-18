const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const { Board, validateBoard } = require("../models/board");
const { User } = require("../models/user");

/*
TODO: get: route for getting all the boards - id's and names - that the requesting user can see
TODO: post: route for creating a new board
TODO: add the other more complicated routes after finishing with the easy ones
 */

/*
	getting board names(this route is not for the full baord data)
	gets all boards that are visible for the requesting user
*/
router.get("/", auth, async (req, res) => {
	const userId = new mongoose.Types.ObjectId(req.user._id);
	const companyId = new mongoose.Types.ObjectId(req.user.company);

	// Query
	const compnayBoards = await Board.find({
		company: companyId
	})
		.or([
			{ read_only_users: { $eq: userId } },
			{ permitted_users: { $eq: userId } }
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
			company: companyId
		}).select("_id");
		board_users = board_users.map(
			user => new mongoose.Types.ObjectId(user._id)
		);
	}

	board = new Board({
		name: req.body.name,
		company: companyId,
		gorups: [],
		column_order: [],
		owner: new mongoose.Types.ObjectId(req.user._id),
		read_only_users: board_users,
		permitted_users: [new mongoose.Types.ObjectId(req.user._id)]
	});

	await board.save();

	res.send(_.pick(board, ["_id", "name", "description"]));
});

module.exports = router;
