const mongoose = require("mongoose");

const stall = mongoose.Schema({
  stallOwnerEmail: {type: String, required: true},

  image: { type: String },
  imageFilename: {type: String},
  bannerImage: { type: String },
  bannerImageFilename: {type: String, default: "[]"},

  stallTitle: { type: String, required: true },
  stallQuantity: { type: String, required: true },
  stallNumber: { type: String, required: true },
  businessOwner: { type: String },
  userId : {type: String, required: true},
  exhibitTitle: {type: String, required: true},
  exhibitId: { type: String, required: true },
  stallType: {type: String, required: true},
  exhibitionEmail: { type: String, required: true },
  contactNumber: { type: String, required: true },
  payment:{type: String, required: true},
  paymentDone : {type: Boolean, default: false},
  qrCodeFilename: {type: String},
  visitors: {type: String, default:"[]"},
  approve: {type: Boolean, default: false}
});

// define the model or the collection name

const stallModel = mongoose.model("stallModel", stall);

module.exports = stallModel;
