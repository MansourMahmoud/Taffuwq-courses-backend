const express = require("express");
const {
  ownerRegistration,
  ownerLogin,
  verifyOwner,
} = require("../controllers/auth/owner/ownerAuth.controller");
const router = express.Router();
const upload = require("../middleware/uploadImage");
const { getSingleOwner } = require("../controllers/owners/owner.controller");

router.route("/register").post(upload.single("avatar"), ownerRegistration);
router.route("/verify").post(verifyOwner);

router.route("/login").post(ownerLogin);

router.route("/:ownerId").get(getSingleOwner);

module.exports = router;
