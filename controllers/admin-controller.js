const admin = require("../model/admin-model");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSignup = async (req, res, next) => {
  try {
    const { email, password, role, roleID, businessOwner } = req.body;

    const userExists = await admin.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new admin({ email, password: hashedPassword, role, roleID, businessOwner });
    await user.save();

    return res.status(201).json({ message: 'Admin registered successfully.' });
  } catch (error) {
    res.status(500).json(error);
  }
}

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await admin.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Admin does not exist' });
    }
    const isMatch = await user.comparePassword(password);
    //
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Admin Login', token, user: { id: user._id, email:user.email, role: user.role, role_id: user.roleID, businessOwner: user.businessOwner || "" } });

  } catch (error) {
    res.status(500).json(error);

  }
}

const getAdminDetails = async (req, res) => {
    try {
        const { id } = req.params
        const adminExist = await admin.findById(id)

        if(!adminExist) {
            return res.status(400).json({message: 'details not exist'})
        }
        const token = jwt.sign({ id }, process.env.JWT_SECRET);

        return res.status(200).json({message: 'details exist', token, user: { id: adminExist._id, email:adminExist.email, role: adminExist.role, role_id: adminExist.roleID, businessOwner: adminExist.businessOwner || "" } })

    } catch (error) {
        res.status(500).json(error);
    }
}

const updateStallAdmin = async (req, res) => {
  try {
    const stallObj = await admin.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!stallObj) {
      return res.status(404).json({ error: 'Exhibition not found' });
    }
    res.status(200).json({ message: "Updated Successfully" });
  } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = {adminLogin, adminSignup, getAdminDetails, updateStallAdmin}