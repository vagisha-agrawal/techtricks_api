const user = require("../model/user-model");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSignup = async (req, res, next) => {
  try {
    const { fullName, email, password, contactNumber, exhibitId, stallId, confirmPassword } = req.body;

    // Validate passwords
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if email already exists
    const userExists = await user.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password (uncomment this for production)
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new user({ fullName, email, password, contactNumber, exhibitId, stallId });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    // Return success response with the new user's ID
    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        stallId: newUser.stallId,
        exhibitId: newUser.exhibitId,
        stallId: newUser.exhibitId
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const userExist = await user.findOne({ email });

    if (!userExist) {
      return res.status(400).json({ message: 'User does not exist' });
    }
    // const isMatch = await userExist.comparePassword(password);
    // console.log(isMatch)
    //
    // if (!isMatch) {
    //   return res.status(400).json({ message: 'Invalid credentials' });
    // }
    const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Admin Login', token, userExist: { id: userExist._id, email:userExist.email, fullName: userExist.fullName, exhibitId: userExist.exhibitId, stallId: userExist.exhibitId} });

  } catch (error) {
    res.status(500).json({ message: 'Error' });

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

        return res.status(200).json({message: 'details exist', token, user: { id: userExist._id, email:userExist.email, fullName: userExist.fullName, exhibitId: userExist.exhibitId, stallId: userExist.exhibitId} })

    } catch (error) {
        res.status(500).json(error);
    }
}
const updateExhibition = async (req, res) => {
    try {
        const userExist = await user.findByIdAndUpdate(req.params.id, req.body, { new: true })

        if(!userExist) {
            return res.status(400).json({message: 'details not exist'})
        }
        res.status(200).json({ message: "Updated Successfully", user: { id: userExist._id, email:userExist.email, fullName: userExist.fullName, exhibitId: userExist.exhibitId, stallId: userExist.exhibitId} });
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = {userSignup, userLogin, getUserDetails, updateExhibition}