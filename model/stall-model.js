const mongoose = require("mongoose");

const stall = mongoose.Schema({
  email: {type: String, required: true},
  image: { type: String },
  stallTitle: { type: String, required: true },
  businessOwner: { type: String },
  userId : {type: String, required: true},
  exhibitTitle: {type: String, required: true},
  exhibitId: { type: String, required: true },
  stallType: {type: String, required: true},
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  imageFilename: {type: String},
  payment:{type: String, required: true},
  paymentDone : {type: Boolean, default: false},
  qrCodeFilename: {type: String},
  approve: {type: Boolean, default: false}
});

// define the model or the collection name

const stallModel = mongoose.model("stallModel", stall);

module.exports = stallModel;
