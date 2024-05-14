const express = require("express");
const {
  createChechoutSession,
} = require("../controllers/payment/payment.controller");
const router = express.Router();

router.route("/checkout").post(createChechoutSession);

module.exports = router;
