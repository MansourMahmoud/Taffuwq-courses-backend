const express = require("express");
const {
  getAllTeacherNotification,
  deleteTeacherNotification,
  updateTeacherNotification,
  deleteOrUpdateAllTeacherNotifications,
} = require("../controllers/teachers/teacherNotification.controller");
const router = express.Router();

router
  .route("/delete-or-update/:teacherId")
  .get(deleteOrUpdateAllTeacherNotifications);

router
  .route("/:teacherNotificationId")
  .get(getAllTeacherNotification)
  .delete(deleteTeacherNotification)
  .patch(updateTeacherNotification);

module.exports = router;
