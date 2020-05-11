const moment = require("moment");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
	Company,
	validateGetInfo,
	validateDelete,
} = require("../models/company");
const { User } = require("../models/user");

// get company data
router.get("/:companyId", auth, async (req, res) => {
	const { error } = validateGetInfo(req.params);
	if (error) return res.status(400).send(error.details[0].message);

	const { companyId } = req.params;

	const company = await Company.findById(companyId);
	if (!company) return res.status(400).send("Invalid company Id.");

	const companyUsers = await User.find({ company: companyId }).select(
		"_id role email name"
	);
	const owner = companyUsers.filter(
		(user) => String(user.role) === "supervisor"
	);

	const formatedDate = moment(company.createdAt).format(
		"MMMM Do YYYY, h:mm:ss a"
	);

	res.send({
		companyName: company.name,
		createdDate: formatedDate,
		companyUsers: companyUsers,
		companyOwner: owner,
		companyId: company._id,
	});
});

// get company name
router.get("/name/:companyId", auth, async (req, res) => {
	const { error } = validateGetInfo(req.params);
	if (error) return res.status(400).send(error.details[0].message);

	const { companyId } = req.params;

	const company = await Company.findById(companyId);
	if (!company) return res.status(400).send("Invalid company Id.");

	res.send({ companyName: company.name, companyId: company._id });
});

// delete a company - only the creator of the company can delete it.
router.delete("/", [auth, admin], async (req, res) => {
	const { error } = validateDelete(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { companyId } = req.body;

	if (req.user.company !== companyId)
		return res.status(400).send("You are not a user in the given company.");
	if (req.user.role !== "supervisor")
		return res.status(403).send("Only the company owner can delete it.");

	await User.deleteMany({ company: companyId });

	const company = await Company.findByIdAndRemove(companyId, {
		useFindAndModify: false,
	});
	if (!company) return res.status(400).send("Invalid company Id.");

	res.send("The company has been deleted.");
});

module.exports = router;
