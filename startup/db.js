const config = require("config");
const mongoose = require("mongoose");

module.exports = function() {
  const db = config.get("db");
  mongoose
    .connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .then(() => console.log(`Connected to ${db}...`));
};
