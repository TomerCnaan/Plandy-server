const _ = require("lodash");
const bcrypt = require("bcrypt");
const randomString = require("crypto-random-string");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const { sendMail } = require("../util/mailer");

const auth = require("../middleware/auth");
const {
	User,
	validate: validateUser,
	validateExisting
} = require("../models/user");
const { Company, validate: validateCompany } = require("../models/company");
const {
	Email_token,
	validate: validateEmail
} = require("../models/emailToken");

/*
 get all the users from a specific company 
*/
router.get("/", auth, async (req, res) => {
	const companyId = req.user.company;
	const companyUsers = await User.find({ company: companyId }).sort("name");
	res.send(companyUsers);
});

/*
 This route is resposnsible for handling user registration.
 This route handles registration without an invitation from an existing company,
 so a new company must be created (every user belongs to a company).
*/
router.post("/", async (req, res) => {
	const { error } = validateUser(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (user) return res.status(400).send("User already reagistered.");

	let company = await Company.findOne({ name: req.body.company.name });
	if (company)
		return res.status(400).send("The company name has already been taken.");

	const { error: companyError } = validateCompany(req.body.company);
	if (companyError) return res.status(400).send(error.details[0].message);

	company = new Company(_.pick(req.body.company, ["name"]));
	await company.save();

	user = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		role: "supervisor",
		company: company._id
	});

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save();

	const token = user.generateAuthToken();
	res
		.header("x-auth-token", token)
		.header("access-control-expose-headers", "x-auth-token")
		.send(_.pick(user, ["_id", "name", "email", "role", "company"]));
});

/*
 send company invitation email to a given email (via gmail)
*/
router.post("/add", auth, async (req, res) => {
	const companyId = req.user.company;
	const { name: companyName } = await Company.findById(companyId, {
		name: 1,
		_id: 0
	});
	console.log(companyName);

	const { error } = validateEmail(req.body);
	if (error) return res.status(400).send(error.details[0].message);
	const emailAdress = req.body.email;

	const token = randomString({ length: 10, type: "url-safe" }); // generate random token for the registration link
	let link = `http://plandy.online/join/${token}`;
	if (!process.env.NODE_ENV) {
		link = `http://localhost:3000/join/${token}`;
	}

	await sendMail(emailAdress, companyName, link);

	const inviteToken = new Email_token({ token, company: companyId });
	await inviteToken.save();

	res.send(`email was sent successfully`);
});

/*
 adds user to an existing company
*/
router.post("/add/:token", async (req, res) => {
	const tokenObject = await Email_token.findOne(
		{ token: req.params.token },
		{ company: 1, _id: 0 }
	).populate("company", "name");
	if (!tokenObject)
		return res.status(404).send("The token provided is not a valid token");
	await Email_token.deleteOne({ token: req.params.token });

	const { company } = tokenObject;
	const { _id, name } = company;

	let user = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		company: { name: name }
	};

	const { error } = validateUser(user);
	if (error) return res.status(400).send(error.details[0].message);

	const isUser = await User.findOne({ email: req.body.email });
	if (isUser) return res.status(400).send("User already reagistered.");

	user = new User({
		...user,
		company: _id
	});

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save();

	const token = user.generateAuthToken();
	res
		.header("x-auth-token", token)
		.header("access-control-expose-headers", "x-auth-token")
		.send(_.pick(user, ["_id", "name", "email", "role", "company"]));
});

/*
 update user 
*/
router.put("/:id", auth, async (req, res) => {
	const { error } = validateExisting(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user;
	if (req.user._id !== req.params.id)
		return res.status(400).send("The user ID does not belong to you.");

	try {
		user = await User.findOneAndUpdate(
			{ _id: new mongoose.Types.ObjectId(req.params.id) },
			{ name: req.body.name },
			{ new: true, useFindAndModify: false }
		);
	} catch (err) {
		return res.status(404).send("The user with the given ID was not found.");
	}
	if (!user)
		return res.status(404).send("The user with the given ID was not found.");
	res.send(user.name);
});

module.exports = router;
