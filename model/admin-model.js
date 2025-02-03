const mongoose = require("mongoose");

const admin = mongoose.Schema({
  fullName: {type: String, required: true},
  email: {type: String, required: true},
  password: { type: String, required: true }
});

// define the model or the collection name

const adminModel = mongoose.model("adminModel", admin);

module.exports = adminModel;