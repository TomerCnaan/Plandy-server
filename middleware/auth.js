const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function auth(req, res, next) {
	const token = req.header("x-auth-token"); //get token from http header
	if (!token) return res.status(401).send("Access denied. No token provided"); //401: Unauthorized

	try {
		const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
		req.user = decoded;
		next(); //pass control to next function
	} catch (ex) {
		// not a valid authentication token
		res.status(400).send("Invalid token.");
	}
};
