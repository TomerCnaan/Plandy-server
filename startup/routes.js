const express = require("express");

const users = require("../routes/users");
const auth = require("../routes/auth");
const roles = require("../routes/roles");
const error = require("../middleware/error");
const columnTypes = require("../routes/columnTypes");

module.exports = function(app) {
	app.use(express.json());
	app.use("/api/users", users);
	app.use("/api/auth", auth);
	app.use("/api/roles", roles);
	app.use("/api/column-types", columnTypes);
	app.use(error);
};
