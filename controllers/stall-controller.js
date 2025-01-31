const stall = require("../model/stall-model");
const exhibition = require("../model/exhibition-model");
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
    const { stallTitle, filename, image, imageFilename, stallOwnerEmail, exhibitId, stallType, stallNumber } = req.body;

    // Check if place already exists
    const placeExist = await stall.findOne({ stallTitle, stallOwnerEmail, exhibitId, stallType });
    if (placeExist) {
      return res.status(400).json({ message: "This stall already exists in this exhibition" });
    }

    const obj = await exhibition.find()
    const exhibitionObj = obj.filter((v)=>v._id.toString() === exhibitId)[0]
    const exhibitStallArr = JSON.parse(exhibitionObj.stallType).map((v)=>{
      if(v.stallType === stallType){
        let stallTypeArr = v.stallQuantity.split(',')
        let stallNumberArr = stallNumber.split(",")
        let resultArray = stallTypeArr.filter(item => !stallNumberArr.includes(item));
        let stallsBookedArr = v.stallsBooked.split(',')
        v.stallsBooked = !!v.stallsBooked ? [...stallsBookedArr, ...stallNumberArr].join(',') : stallNumberArr.join(',')
        v.stallQuantity = resultArray.join(',')
        return v
      } else {
        return v
      }
    })
    const exhibitionStallUpdate = await exhibition.findByIdAndUpdate(exhibitId, {stallType : JSON.stringify(exhibitStallArr)}, {new:true})

    // Strip out base64 metadata and pass to upload function
    const base64Data = image.split(",")[1];
    await uploadFile(`stall/${imageFilename}`, base64Data);
    delete req.body.image;
    const createStall = await stall.create({...req.body, qrCodeFilename: `qrCodes/stall_${stallTitle}_${stallOwnerEmail}_${exhibitId}_QR.jpeg`});

    generateQRCodeBase64(`${process.env.URL}stall-registeration?stallId=${createStall._id}`)
      .then( async (base64) => {
        await uploadFile(`qrCodes/stall_${title}_${stallOwnerEmail}_${exhibitId}_QR.jpeg`, base64.split(",")[1]);
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
    // console.log("stallObj:- ", stallObj)

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
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

const getQuantityOfStalls = async (req, res) => {
  try {
    const {exhibitArr} = req.body

    if(exhibitArr.length){
      let array = await exhibition.find();
      let exhibitionArr = array.filter(v=>exhibitArr.includes(v._id.toString()))
      const stallArr = []
      exhibitionArr.forEach((v)=>{
        let obj = {};
        obj['id'] = v._id.toString();
        obj['stall'] = [],
        // obj['booked'] = [],
        JSON.parse(v.stallType).forEach((s)=>{
          let objs = {}
          objs[s.stallType] = parseInt(s.stallQuantity.split(',').length)
          objs['booked'] = parseInt(s.stallsBooked.split(',').length)
          // obj['booked'] = parseInt(s.stallQuantity.split(',').length)
          if(Object.keys(objs).length){
            obj.stall.push(objs)
          }
        })
        if(obj.id && obj.stall && obj.stall.length){
          stallArr.push(obj)
        }
      })
      
      if(exhibitionArr.length && stallArr.length){
        return res.status(200).json({message:"array found", data: stallArr})
      } else {
        return res.status(200).json({message:"array found", data: []})

      }

    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); // Provide a more generic error message for security reasons
  }
}

module.exports = {addStall, getAllStall, getStallById, getAllStallByExhibitionId, getAllStallByUserId, updateStall, getStallByEmails, getQuantityOfStalls}