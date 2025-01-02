const exhibition = require("../model/exhibition-model");
const admin = require("../model/admin-model")
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

async function generateQRCodeBase64(obj) {
  try {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(obj);

    // Generate the QR code as a Base64 string
    const qrCodeBase64 = await QRCode.toDataURL(jsonString);

    return qrCodeBase64; // Return the Base64 string
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

const addExhibition = async (req, res) => {
  try {
    const { title, filename, image, imageFilename, email } = req.body;

    // Check if place already exists
    const emailExist = await exhibition.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "This email is already exists" });
    }

    // Strip out base64 metadata and pass to upload function
    const imageArr = JSON.parse(image)
    const imageFilenameArr = JSON.parse(imageFilename)
    for (let i = 0; i < imageArr.length; i++) {
      const base64Data = imageArr[i].split(",")[1]; // Strip out base64 metadata
      const filename = `exhibition/${imageFilenameArr[i]}`; // Use corresponding filename
      await uploadFile(filename, base64Data); // Upload the file
    }

    
    delete req.body.image;
    // debugger
    // let obj = {email,}

    const createdExhibition = await exhibition.create({...req.body, qrCodeFilename: `qrCodes/${email}_QR.jpg`} );
    console.log("createdExhibition:- ", createdExhibition)
    generateQRCodeBase64(createdExhibition._id)
      .then( async (base64) => {
        console.log("QR Code Base64:");
        // console.log(base64); // Output the Base64 string
        await uploadFile(`qrCodes/${email}_QR.jpg`, base64.split(",")[1]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    res.status(200).json({ message: "Exhibition place added successfully", exhibitionId: createdExhibition._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
};

const getExhibition = async (req, res) => {
  try {
    let exhibitionArr = await exhibition.find()
    if(exhibitionArr.length){
      res.status(200).json({message: 'Data found', data: exhibitionArr})
    } else {
      res.status(400).json({message: 'Data is empty'})
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

const getExhibitionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID is invalid", data: {} });
    } else {
      let objExist = await exhibition.findById(id);
      if (objExist) {
        return res.status(200).json({ message: "data found", data: objExist });
      } else {
        return res.status(400).json({ message: "data not found", data: {} });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

const filterExhibitionByAddress = async (req, res) => {
  try {
    const { venue } = req.params;
    let arrExist = await exhibition.find();
    let objExist = arrExist.filter((v)=>v.city.toLowerCase().includes(venue))
    if (objExist.length) {
      return res.status(200).json({ message: "data found", data: objExist });
    } else {
      return res.status(400).json({ message: "data not found", data: {} });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

const updateExhibitionById = async (req, res) => {
  try {
    const exhibitObj = await exhibition.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!exhibitObj) {
      return res.status(404).json({ error: 'Exhibition not found' });
    }
    res.status(200).json({ message: "Updated Successfully", data : exhibitObj });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

module.exports = {addExhibition, getExhibition, getExhibitionById, updateExhibitionById, filterExhibitionByAddress}