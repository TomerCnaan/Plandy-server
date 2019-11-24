const express = require("express");
const router = express.Router();

const { Column_type } = require("../models/columnType");

router.get("/", async (req, res) => {
	const columnTypes = await Column_type.find()
		.sort("type")
		.select("type options");
	res.send(columnTypes);
});

module.exports = router;
