const express = require("express");

const users = require("../routes/users");
const roles = require("../routes/roles");
const error = require("../middleware/error");

module.exports = function(app) {
	app.use(express.json());
	app.use("/api/users", users);
	app.use("/api/roles", roles);
	app.use(error);
};
