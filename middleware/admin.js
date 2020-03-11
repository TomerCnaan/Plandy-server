/*
denies acces if user is not an admin or a supervisor.
 */

module.exports = function(req, res, next) {
	if (req.user.role === "member") return res.status(403).send("Access denied."); //403: Forbidden

	next();
};
