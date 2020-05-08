const moment = require("moment");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const { Company, validateGetInfo } = require("../models/company");
const { User } = require("../models/user");

// get company data
router.get("/:companyId", auth, async (req, res) => {
	const { error } = validateGetInfo(req.params);
	if (error) return res.status(400).send(error.details[0].message);

	const { companyId } = req.params;
	console.log(req.body);

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
	});
});

module.exports = router;
