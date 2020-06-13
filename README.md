Plandy-server:

This is the backend side of plandy.online.
Built with Node.js for the server and MongoDB for the data base.


File Tree:
.
|-- README.md
|-- config   
|   |-- custom-environment-variables.json
|   `-- default.json
|-- index.js
|-- logfile.log
|-- middleware
|   |-- admin.js
|   |-- auth.js
|   `-- error.js
|-- models
|   |-- board.js
|   |-- boardColumn.js
|   |-- columnType.js
|   |-- company.js
|   |-- emailToken.js
|   |-- group.js
|   |-- role.js
|   |-- task.js
|   `-- user.js
|-- package-lock.json
|-- package.json
|-- routes
|   |-- auth.js
|   |-- boards.js
|   |-- columnTypes.js
|   |-- columns.js
|   |-- groups.js
|   |-- roles.js
|   |-- tasks.js
|   `-- users.js
|-- startup
|   |-- config.js
|   |-- cors.js
|   |-- db.js
|   |-- logging.js
|   |-- prod.js
|   |-- routes.js
|   |-- sock.js
|   `-- validation.js
|-- uncaughtExceptions.log
`-- util
    `-- mailer.js

6 directories, 37 files