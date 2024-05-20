const express = require("express");
const {
  addOrder,
  getAllOrdersForSingleStudent,
} = require("../controllers/students-orders/studentOrder.controller");

const router = express.Router();

router.route("/").post(addOrder);
router.route("/:studentId").get(getAllOrdersForSingleStudent);

module.exports = router;
