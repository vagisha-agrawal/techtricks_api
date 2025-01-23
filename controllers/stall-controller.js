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
const QRCode = require('qrcode');
const mime = require("mime-types");

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
  const bufferContent = Buffer.from(fileContent, "base64");

  // Get the MIME type from the file extension
  const extension = fileName.split(".").pop(); // Extract file extension
  const contentType = mime.lookup(extension) || "application/octet-stream";

  console.log("contentType:- ", contentType)

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: bufferContent,
    ACL: "public-read",
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log("Uploaded with Content-Type:", contentType);
  } catch (error) {
    console.error("Upload Error:", error.message);
    throw error;
  }
};

async function generateQRCodeBase64(link) {
  try {
    // Convert the object to a JSON string
    const jsonString = link;

    // Generate the QR code as a Base64 string
    const qrCodeBase64 = await QRCode.toDataURL(jsonString);

    return qrCodeBase64; // Return the Base64 string
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

const addStall = async (req, res) => {
  try {
    const { title, filename, image, imageFilename, stallOwnerEmail } = req.body;

    // Check if place already exists
    // const placeExist = await stall.findOne({ title });
    /* if (placeExist) {
      return res.status(400).json({ message: "This place already exists" });
    } */

    // Strip out base64 metadata and pass to upload function
    const base64Data = image.split(",")[1];
    await uploadFile(`stall/${imageFilename}`, base64Data);
    delete req.body.image;
    const createStall = await stall.create({...req.body, qrCodeFilename: `qrCodes/stall_${stallOwnerEmail}_QR.jpg`});

    generateQRCodeBase64(`${process.env.URL}stall-registeration?stallId=${createStall._id}`)
      .then( async (base64) => {
        // console.log("QR Code Base64:");
        // console.log(base64); // Output the Base64 string
        await uploadFile(`qrCodes/stall_${stallOwnerEmail}_QR.jpeg`, base64.split(",")[1]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

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
};

const getStallById = async (req, res) => {
  try {
    const { id } = req.params
    const stalls = await stall.findById(id);
    console.log("stalls:- ", stalls)
    if(!stalls){
      return res.status(400).json({message:'Data not Found!'})
    }
    return res.status(200).json({message:'Data found', data:stalls})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
};

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
    // console.log("id:- ", id)
    const stallObj = await stall.findByIdAndUpdate(id, req.body, { new: true })
    console.log("stallObj:- ", stallObj)

    if (!stallObj) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.status(200).json({ message: "Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

const getStallByEmails = async (req, res) => {
  try {
    let { email } = req.params
    const arr = await stall.find();
    const newArr = arr.filter((v)=>v.exhibitionEmail === email || v.stallOwnerEmail === email)

    if(!newArr.length){
      return res.status(404).json({message: 'No data found'})
    }

    res.status(200).json({message: 'Data Found', data: newArr})

  } catch (error) {

  }
}

module.exports = {addStall, getAllStall, getStallById, getAllStallByExhibitionId, getAllStallByUserId, updateStall, getStallByEmails}