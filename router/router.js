const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const authenticateToken = require("../controllers/auth-middleware");
const { adminSignup } = require('../controllers/admin-controller');
const { addCollection, getCollection } = require('../controllers/collection-controller');
const { getService, addService } = require('../controllers/service-controller');


// router.route("/register-user").post(userSignup)
router.route("/register-admin").post(adminSignup);

router.route("/add-collection").post(addCollection);
router.route("/get-collection").get(getCollection);

router.route("/add-service").post(addService);
router.route("/get-service").get(getService);



/* const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
}); */

const upload = multer({
  limits: {
    fieldSize: 10 * 1024 * 1024, // 10MB limit for field values
    // fields: 10 // Maximum number of non-file fields
  }
});




module.exports = router;