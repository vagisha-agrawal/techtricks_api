const admin = require("../model/admin-model");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSignup = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validate passwords
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if email already exists
    const adminExists = await admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password (uncomment this for production)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin
    const newAdmin = new admin({ fullName, email, password});

    // Save the admin to the database
    await newAdmin.save();

    // Generate JWT token
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET);

    // Return success response with the new admin's ID
    return res.status(201).json({
      message: 'Admin registered successfully.',
      token,
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        fullName: newAdmin.fullName
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

const loginAdmin = async (req, res, next) => {
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

    res.status(200).json({ message: 'Admin Login', token, user: { id: user._id, email:user.email} });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

module.exports = {adminSignup, loginAdmin}