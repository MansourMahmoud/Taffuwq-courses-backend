const express = require("express");
const {
  getAllStudentNotification,
  deleteStudentNotification,
  updateStudentNotification,
  deleteOrUpdateAllStudentNotifications,
} = require("../controllers/students/studentNotification.controller");
const router = express.Router();

router
  .route("/delete-or-update/:studentId")
  .get(deleteOrUpdateAllStudentNotifications);

router
  .route("/:studentNotificationId")
  .get(getAllStudentNotification)
  .delete(deleteStudentNotification)
  .patch(updateStudentNotification);

module.exports = router;
