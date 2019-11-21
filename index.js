const winston = require("winston");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

require("./startup/cors")(app);
require("./startup/logging")();
require("./startup/sock")(io);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config");
require("./startup/validation")();

const port = process.env.PORT || 5000;
server.listen(port, () => winston.info(`Listening on port ${port}...`));
