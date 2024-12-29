const user = require("../model/user-model");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSignup = async (req, res, next) => {
  try {
    const { email, password, contactNumber, exhibitId,  stallId } = req.body;

    const userExists = await user.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new user({ fullName, email, password: hashedPassword, contactNumber, exhibitId,  stallId });
    await user.save();

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json(error);
  }
}

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await user.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Admin does not exist' });
    }
    const isMatch = await user.comparePassword(password);
    //
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Admin Login', token, user: { id: user._id, email:user.email, fullName: user.fullName, stallId: user.stallId, exhibitId: user.exhibitId} });

  } catch (error) {
    res.status(500).json(error);

  }
}

const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params
        const userExist = await user.findById(id)

        if(!userExist) {
            return res.status(400).json({message: 'details not exist'})
        }
        const token = jwt.sign({ id }, process.env.JWT_SECRET);

        return res.status(200).json({message: 'details exist', token, user: { id: userExist._id, email:userExist.email, fullName: userExist.fullName, stallId: userExist.stallId, exhibitId: userExist.exhibitId} })

    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = {userSignup, userLogin, getUserDetails}