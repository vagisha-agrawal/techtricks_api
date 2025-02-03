const service = require("../model/service-model");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addService = async (req, res, next) => {
  try {
    const { servicePhoto, serviceName } = req.body;

    // Check if email already exists
    const serviceExists = await service.findOne({ serviceName });
    if (serviceExists) {
      return res.status(400).json({ message: 'Service already exists' });
    }


    // Create the new service
    const createService = await service.create({...req.body});

    // Return success response with the new service's ID
    return res.status(200).json({message : 'Admin registered successfully.', data : createService});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

const getService = async (req, res) => {
    try {
        const services = await service.find();

        return res.status(200).json({message: "Data found", data: services})
    } catch (err) {
        return res.status(500).json({ message: 'An error occurred during registration.' });
    }
}

module.exports = {addService, getService}