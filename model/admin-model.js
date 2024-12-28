const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const admin = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  roleID: { type: String, default: '' },
  businessOwner: {type: String, default: ''}
});

// define the model or the collection name

admin.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const adminModel = mongoose.model("adminModel", admin);

module.exports = adminModel;