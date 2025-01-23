const admin = require("../model/admin-model");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSignup = async (req, res, next) => {
  try {
    const { email, password, role, roleID, businessOwner } = req.body;

    const userExists = await admin.findOne({ email });
    if (userExists) {
      const obj = await admin.findOne({email, role})
      if(obj) {
        return res.status(400).json({ message: 'Email already exists' });
      } else {
        let objs = [userExists.role.split(',')]
        objs.push(role)
        await admin.findByIdAndUpdate(userExists._id,{businessOwner, role: objs.join(',')}, { new: true })
        return res.status(200).json({ message: 'Admin registered successfully.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new admin({ ...req.body, password: hashedPassword });
    await user.save();

    return res.status(200).json({ message: 'Admin registered successfully.' });
  } catch (error) {
    res.status(500).json(error);
  }
}

const updateExhibitionsInAdmin = async (req, res) => {
  try {
    const obj = await admin.findOne({role: 'admin'})
    if(obj){
      console.log("object", obj)
      const { exhibitionEmails } = req.body
      await admin.findByIdAndUpdate(obj._id, {exhibitionEmails}, { new: true })
      res.status(200).json({message:"exhibition Email added"})
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
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

    res.status(200).json({ message: 'Admin Login', token, user: { id: user._id, email:user.email, role: user.role, role_id: user.roleID, businessOwner: user.businessOwner || "", exhibitionEmails: user.exhibitionEmails || "" , stallId: user.stallId} });

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

      return res.status(200).json({message: 'details exist', token, user: { id: adminExist._id, email:adminExist.email, role: adminExist.role, role_id: adminExist.roleID, businessOwner: adminExist.businessOwner || "", exhibitionEmails: adminExist.exhibitionEmails || "", stallId: adminExist.stallId } })

    } catch (error) {
        res.status(500).json(error);
    }
}

const updateStallAdmin = async (req, res) => {
  try {
    let {id} = req.params
    const stallObj = await admin.findByIdAndUpdate(id, req.body, { new: true })

    if (!stallObj) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    let { email, role, stallId } = stallObj
    const token = jwt.sign({ id }, process.env.JWT_SECRET);
    console.log("token:- ", token)
    res.status(200).json({ message: "Updated Successfully", token, user: { id: stallObj._id, email, role, role_id: stallObj.roleID, businessOwner: stallObj.businessOwner || "", exhibitionEmails: stallObj.exhibitionEmails || "", stallId } });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const findEmail = async (req, res) => {
  try {
    let {email} = req.params
    const arr = await admin.find()
    const adminExist = arr.filter((v)=>v.email === email)
    if(adminExist.length){
      return res.status(404).json({ error: 'Email already exist', data: adminExist });
    } 
    res.status(200).json({message:'Email not found', data: []})
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {adminLogin, adminSignup, getAdminDetails, updateStallAdmin, findEmail, updateExhibitionsInAdmin}