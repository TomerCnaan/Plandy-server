const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const { Column_type } = require("../models/columnType");

router.get("/", auth, async (req, res) => {
	const columnTypes = await Column_type.find()
		.sort("type")
		.select("type options");
	res.send(columnTypes);
});

module.exports = router;
