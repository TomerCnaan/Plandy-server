const moment = require("moment");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const { Company, validateGetInfo } = require("../models/company");
const { User } = require("../models/user");

// get company data
router.get("/", auth, async (req, res) => {
	const { error } = validateGetInfo(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const { companyId } = req.body;

	const company = await Company.findById(companyId);
	if (!company) return res.status(400).send("Invalid company Id.");

	const companyUsers = await User.find({ company: companyId }).select(
		"_id role email name"
	);

	const formatedDate = moment(company.createdAt).format(
		"MMMM Do YYYY, h:mm:ss a"
	);

	res.send({
		companyName: company.name,
		createdDate: formatedDate,
		companyUsers: companyUsers,
	});
});

module.exports = router;
