const express = require("express");

const users = require("../routes/users");
const auth = require("../routes/auth");
const roles = require("../routes/roles");
const columnTypes = require("../routes/columnTypes");
const boards = require("../routes/boards");
const groups = require("../routes/groups");
const tasks = require("../routes/tasks");
const columns = require("../routes/columns");
const cells = require("../routes/cells");
const companies = require("../routes/companies");
const error = require("../middleware/error");

module.exports = function (app) {
	app.use(express.json());
	app.use("/api/users", users);
	app.use("/api/auth", auth);
	app.use("/api/roles", roles);
	app.use("/api/column-types", columnTypes);
	app.use("/api/boards", boards);
	app.use("/api/groups", groups);
	app.use("/api/tasks", tasks);
	app.use("/api/columns", columns);
	app.use("/api/cells", cells);
	app.use("/api/companies", companies);
	app.use(error);
};
