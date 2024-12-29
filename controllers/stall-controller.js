const stall = require("../model/stall-model");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
const buffer = require("buffer").Buffer;
const AWS = require("aws-sdk");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const mongoose = require("mongoose");

const s3AWS = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID, // Replace with your Cloudflare R2 Access Key ID
  secretAccessKey: process.env.SECRET_ACCESS_KEY, // Replace with your Cloudflare R2 Secret Access Key
  endpoint: "https://9ae52e491f6c8c9951910b6c761115ef.r2.cloudflarestorage.com", // Replace with your Cloudflare R2 endpoint
  region: "auto", // Cloudflare R2 region (auto should work for most cases)
  signatureVersion: "v4",
});

// Replace with your actual values
const ACCOUNT_ID = process.env.ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;

const s3GetClient = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const s3Client = new S3Client({
  region: "auto", // R2 doesn't use specific regions, so use 'auto'
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const extractContentType = (fileContent) => {
  // Match the content type in the data URL
  const match = fileContent.match(/^data:(\S+);base64,/);
  return match ? match[1] : "application/octet-stream"; // Default to binary if content type isn't found
};

// Example: Uploading a file to R2
const uploadFile = async (fileName, fileContent) => {
  // Decode base64 image content
  const bufferContent = Buffer.from(fileContent, "base64");

  // Extract content type dynamically
  const contentType = extractContentType(fileContent);

  // Set up params for uploading to S3
  const params = {
    Bucket: BUCKET_NAME, // The bucket name where the file will be uploaded
    Key: fileName, // File name in the S3 bucket
    Body: bufferContent, // File content as Buffer
    ACL: "public-read", // Make the object publicly readable
    ContentType: contentType, // Dynamically set content type
    // CacheControl: 'public, max-age=31536000'
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log("Image uploaded successfully!");
  } catch (error) {
    console.error("Error uploading image:", error.message);
    throw new Error(error.message); // Propagate the error to the calling function
  }
};

const addStall = async (req, res) => {
  try {
    const { title, filename, image, imageFilename } = req.body;

    // Check if place already exists
    // const placeExist = await stall.findOne({ title });
    /* if (placeExist) {
      return res.status(400).json({ message: "This place already exists" });
    } */

    // Strip out base64 metadata and pass to upload function
    const base64Data = image.split(",")[1];
    await uploadFile(`stall/${imageFilename}`, base64Data);
    delete req.body.image;
    const createStall = await stall.create(req.body);

    res.status(200).json({ message: "Stall added successfully", data: createStall });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
};

const getAllStall = async (req, res) => {
  try {
    const stalls = await stall.find();
    if(stalls.length === 0){
      return res.status(400).json({message:'Data not Found!'})
    }
    return res.status(200).json({message:'Data found', data:stalls})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

const getAllStallByExhibitionId = async (req, res) => {
  try {
    const {exhibitId} = req.params
    const stallsArr = await stall.find();
    const stalls = stallsArr.filter((v) => v.exhibitId === exhibitId)

    if(stalls.length === 0){
      return res.status(400).json({message:'Data not Found!'})
    }
    
    return res.status(200).json({message:'Data found', data:stalls})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

const getAllStallByUserId = async (req, res) => {
  try {
    const {userid} = req.params
    const stallsArr = await stall.find();
    const stalls = stallsArr.filter((v) => v.userId === userid)

    if(stalls.length === 0){
      return res.status(400).json({message:'Data not Found!'})
    }
    
    return res.status(200).json({message:'Data found', data:stalls})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

const updateStall = async (req, res) => {
  try {
    let {id} = req.params
    const stallObj = await stall.findByIdAndUpdate(id, req.body, { new: true })

    if (!stallObj) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.status(200).json({ message: "Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

module.exports = {addStall, getAllStall, getAllStallByExhibitionId, getAllStallByUserId, updateStall}