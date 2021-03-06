const _ = require("lodash");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const { User } = require("../models/user");

// login existing user
router.post("/", async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send("Invalid email or password.");

	// Check if password matches the encrypted password in the data base
	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send("Invalid email or password.");

	const token = user.generateAuthToken(); //create auth token with user details
	res.send(token);
});

function validate(req) {
	const schema = {
		email: Joi.string().min(2).max(255).required().email(),
		password: Joi.string().min(6).max(255).required(),
	};
	return Joi.validate(req, schema);
}

module.exports = router;
