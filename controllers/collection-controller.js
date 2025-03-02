const collection = require("../model/collection-model");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addCollection = async (req, res, next) => {
  try {
    const { collectionPhoto, collectionName } = req.body;

    // Check if email already exists
    const collectionExists = await collection.findOne({ collectionName });
    if (collectionExists) {
      return res.status(400).json({ message: 'Collection already exists' });
    }


    // Create the new collection
    const createCollection = await collection.create({...req.body});

    // Return success response with the new collection's ID
    return res.status(200).json({message : 'Collection added successfully.', data : createCollection});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

const getCollection = async (req, res) => {
    try {
        const collections = await collection.find();

        return res.status(200).json({message: "Data found", data: collections})
    } catch (err) {
        return res.status(500).json({ message: 'An error occurred during registration.' });
    }
};

const updateCollection = async (req, res) => {
  try {
    const { id } = req.params

    const update = await collection.findByIdAndUpdate(id,req.body,{new: true})

    if (!update) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.status(200).json({ message: "Collection updated Successfully", data : update });
    
  } catch (err) {
      return res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params

    const update = await collection.findByIdAndDelete(id)

    if (!update) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.status(200).json({ message: "Collection deleted Successfully" });
    
  } catch (err) {
      return res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

module.exports = {addCollection, getCollection, updateCollection, deleteCollection}