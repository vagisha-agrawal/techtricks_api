const mongoose = require("mongoose");

const collection = mongoose.Schema({
  collectionPhoto: {type: String, default: ''},
  collectionName: {type: String, required: true}
});

// define the model or the collection name

const collectionModel = mongoose.model("collectionModel", collection);

module.exports = collectionModel;