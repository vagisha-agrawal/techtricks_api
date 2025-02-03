const mongoose = require("mongoose");

const service = mongoose.Schema({
  servicePhoto: {type: String, default: ''},
  servicePhotoCss: {type: String, default: ''},
  serviceName: {type: String, required: true},
  collectionType: {type: String, required: true},
  tutorialLink: {type: String, required: true},
  redirectionLink: {type: String, required: true},
});

// define the model or the service name

const serviceModel = mongoose.model("serviceModel", service);

module.exports = serviceModel;