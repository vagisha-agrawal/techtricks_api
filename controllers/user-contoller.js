const user = require("../model/user-model");
const exhibition = require("../model/exhibition-model");
const stall = require("../model/stall-model");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = async (req, res) => {
  try {
    const arr = await user.find()
    console.log(arr)
    return res.status(200).json({message: "User Fetched Successfully", data: arr})
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred during registration.' });
  }
}

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
        const { id } = req.params
        const userExist = await user.findByIdAndUpdate(id, req.body, { new: true })
        console.log("userExist:- ", userExist)

        if(!userExist) {
            return res.status(400).json({message: 'details not exist'})
        }
        res.status(200).json({ message: "Updated Successfully", user: { id: userExist._id, email:userExist.email, fullName: userExist.fullName, exhibitId: userExist.exhibitId, stallId: userExist.exhibitId} });
    } catch (error) {
        res.status(500).json(error);
    }
}

const getVisitorAsPerEmail = async (req, res) => {
  try {
    console.log("arr:- ", req.params)
    const { email } = req.params
    const Visitor = await user.find()
    const arr = []
    Visitor.forEach((v)=>{
      if(JSON.parse(v.exhibitId).length){
        JSON.parse(v.exhibitId).map((s)=>{
          if(s.email === email){
            arr.push(v)
          }
        })
      }
    })
    return res.status(200).json({message:"Fetched", data: arr})
  } catch (error) {
    res.status(500).json(error);
  }
}

const getAttachedExhibitionAndStallDetails = async ( req, res) => {
  try {
    const { id } = req.params
    const exhibitionDetails = await exhibition.findById(id)
    if(!exhibitionDetails){
      return res.status(400).json({ message: "data not found" });
    }

    console.log("exhibitionDetails:- ", exhibitionDetails)

    const arr = await stall.find();
    const newArr = arr.filter((v)=>v.exhibitionEmail === exhibitionDetails.email && v.approve === true && v.paymentDone === true)
    delete exhibitionDetails['stallType']
    const obj = {exhibitionDetails : exhibitionDetails}
    obj.exhibitionDetails['stallType'] = JSON.stringify(newArr)

    return res.status(200).json({message: 'Data Found', data : obj})

  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {userSignup, userLogin, getUserDetails, updateExhibition, getUsers, getVisitorAsPerEmail, getAttachedExhibitionAndStallDetails}