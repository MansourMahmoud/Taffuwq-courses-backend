const express = require("express");
const {
  addOrder,
} = require("../controllers/students-orders/studentOrder.controller");

const router = express.Router();

router.route("/").post(addOrder);

module.exports = router;
