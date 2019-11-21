const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const { User, validate: validateUser } = require("../models/user");
const { Company, validate: validateCompany } = require("../models/company");

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already reagistered.");

  let company = await Company.findOne({ name: req.body.company.name });
  if (company)
    return res.status(400).send("The company name has already been taken.");

  const { error: companyError } = validateCompany(req.body.company);
  if (companyError) return res.status(400).send(error.details[0].message);

  company = new Company(_.pick(req.body.company, ["name"]));
  await company.save();

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  //TODO: add company property to the user object and save it to the DB
});

module.exports = router;
