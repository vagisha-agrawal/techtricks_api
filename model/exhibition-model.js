const mongoose = require("mongoose");

const exhibition = mongoose.Schema({
  image: { type: String },
  imageFilename: { type: String },
  floorPlanImage: { type: String },
  floorPlanImageFilename: { type: String },
  title: { type: String, required: true },
  city: { type: String, required: true },
  businessOrganiserName: { type: String, required: true },
  businessOrganiserCommitee: { type: String, required: true },
  email: { type: String, default:'' },
  password: { type: String, default:'' },
  // brandName: { type: String, required: true },
  description: { type: String, required: true },
  tAndC: { type: String },
  refundPolicy: { type: String },
  // date: { type: String, required: true },
  startDate: { type: String, required: true },
  lastDate: { type: String, default: '' },
  stallType: { type: String, required: true },
  timing: { type: String, default: "" },
  stallCancellation: { type: String, default: "" },
  // email: { type: String, required: true },
  address: { type: String, required: true },
  addressCoordinated: { type: String, required: true },
  contactNumber: { type: String, required: true },
  active: { type: Boolean, default: true },
  qrCodeFilename: {type: String},
  visitors: {type: String, default:"[]"},
  stallsBooked: {type: String, default: "[]"},
  publish: { type: Boolean, default: false },
});

// define the model or the collection name

const exhibitionModel = mongoose.model("exhibitionModel", exhibition);

module.exports = exhibitionModel;
