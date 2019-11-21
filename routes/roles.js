const express = require("express");
const router = express.Router();

const { Role } = require("../models/role");

router.get("/", async (req, res) => {
	const roles = await Role.find()
		.sort("role")
		.select("role");
	res.send(roles);
});

module.exports = router;
