const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { addExhibition, getExhibition, getExhibitionById, updateExhibitionById, filterExhibitionByAddress, getExhibitionByEmail } = require("../controllers/exhibition-controller");
const { adminSignup, adminLogin, getAdminDetails, updateStallAdmin, findEmail, updateExhibitionsInAdmin } = require('../controllers/admin-controller');

const authenticateToken = require("../controllers/auth-middleware");
const { addStall, getAllStall, getAllStallByExhibitionId, getAllStallByUserId, updateStall, getStallByEmails, getStallById } = require('../controllers/stall-controller');
const { getUserDetails, userLogin, userSignup, updateExhibition, getUsers, getVisitorAsPerEmail, getAttachedExhibitionAndStallDetails, getRegisteredStalls } = require('../controllers/user-contoller');

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


router.route("/get-exhibition").get(getExhibition)
router.route("/get-exhibition/:id").get(getExhibitionById)
router.route("/get-email-exhibition/:email").get(getExhibitionByEmail)
router.route("/filter-exhibition/:venue").get(filterExhibitionByAddress)
router.route("/add-exhibition").post(upload.single('image'), addExhibition)
router.route("/set-password/:id").put(updateExhibitionById)
router.route("/update-exhibition/:id").put(updateExhibitionById)

router.route("/add-stall").post(authenticateToken, upload.single('image'), addStall)
router.route("/get-stalls").get(getAllStall)
router.route("/stall-by-id/:id").get(getStallById)
router.route("/get-stalls/:exhibitId").get(getAllStallByExhibitionId)
router.route("/get-stalls-by-email/:email").get(getStallByEmails)
router.route("/get-stalls-byuserid/:userid").get(getAllStallByUserId);
router.route("/update-stall/:id").put(updateStall);

router.route("/add-stall-auth").post(adminSignup)
router.route("/add-auth").post(adminSignup)
router.route("/add-exhibitEmail-auth").put(updateExhibitionsInAdmin)
router.route("/verify-email/:email").get(findEmail)
router.route("/add-exhibition-obj").post(adminSignup)
router.route("/admin-login").post(adminLogin)
router.route("/get-details/:id").get(getAdminDetails)
router.route("/update-details/:id").put(updateStallAdmin)

router.route("/register-visitor").post(userSignup)
router.route("/get-registered-stalls").post(getRegisteredStalls)
router.route("/login-visitor").post(userLogin)
router.route("/user-visitor").get(getUsers)
router.route("/visitor-exhibition-email/:email").get(getVisitorAsPerEmail)
router.route("/get-user-details/:id").get(getUserDetails)
router.route("/attach-exhibition/:id").put(updateExhibition)
router.route("/get-exhibition-details/:id").get(getAttachedExhibitionAndStallDetails)

module.exports = router;