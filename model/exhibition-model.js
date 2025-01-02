const mongoose = require("mongoose");

const exhibition = mongoose.Schema({
  image: { type: String },
  title: { type: String, required: true },
  city: { type: String, required: true },
  owner: { type: String },
  email: { type: String, default:'' },
  password: { type: String },
  // brandName: { type: String, required: true },
  description: { type: String, required: true },
  tAndC: { type: String },
  refundPolicy: { type: String, required: true },
  date: { type: String, required: true },
  startDate: { type: String, required: true },
  lastDate: { type: String, required: true },
  stallType: { type: String, required: true },
  timing: { type: String, default: "" },
  stallCancellation: { type: String, default: "" },
  // email: { type: String, required: true },
  address: { type: String, required: true },
  addressCoordinated: { type: String, required: true },
  contactNumber: { type: String, required: true },
  active: { type: Boolean, default: true },
  imageFilename: { type: String },
  qrCodeFilename: {type: String},
  publish: { type: Boolean, default: false },
});

// define the model or the collection name

const exhibitionModel = mongoose.model("exhibitionModel", exhibition);

module.exports = exhibitionModel;
