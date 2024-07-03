const express = require("express");

const router = express.Router();
const upload = require("../middleware/uploadImage");
const {
  resetPass,
  verifyCode,
  checkEmail,
} = require("../controllers/reset-password/resetPassword.controller");

router.route("/").post(resetPass);

router.route("/verify-code").post(verifyCode);
router.route("/check-email").post(checkEmail);

module.exports = router;
