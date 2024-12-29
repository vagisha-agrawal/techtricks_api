const mongoose = require("mongoose");

const user = mongoose.Schema({
  fullName: {type: String, required: true},
  email: {type: String, required: true},
  password: { type: String, required: true },
  contactNumber : {type: String, required: true},
  exhibitId: { type: String, required: true },
  stallId : {type: String, required: true},
});

// define the model or the collection name

const userModel = mongoose.model("userModel", user);

module.exports = userModel;
