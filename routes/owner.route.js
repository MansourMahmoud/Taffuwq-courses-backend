const express = require("express");
const {
  ownerRegistration,
  ownerLogin,
  verifyOwner,
} = require("../controllers/auth/owner/owner.controller");
const router = express.Router();
const upload = require("../middleware/uploadImage");

router.route("/register").post(upload.single("ownerAvatar"), ownerRegistration);
router.route("/verify").post(verifyOwner);

router.route("/login").post(ownerLogin);

module.exports = router;
