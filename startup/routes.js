const express = require("express");

const users = require("../routes/users");
const auth = require("../routes/auth");
const roles = require("../routes/roles");
const columnTypes = require("../routes/columnTypes");
const boards = require("../routes/boards");
const groups = require("../routes/groups");
const columns = require("../routes/columns");
const error = require("../middleware/error");

module.exports = function (app) {
	app.use(express.json());
	app.use("/api/users", users);
	app.use("/api/auth", auth);
	app.use("/api/roles", roles);
	app.use("/api/column-types", columnTypes);
	app.use("/api/boards", boards);
	app.use("/api/groups", groups);
	app.use("/api/columns", columns);
	app.use(error);
};
