const express = require("express");
const {
  getAllAdminNotification,
  deleteAdminNotification,
  updateAdminNotification,
  deleteOrUpdateAllAdminNotifications,
} = require("../controllers/owners/adminNotification.controller");
const router = express.Router();

router
  .route("/delete-or-update/:ownerId")
  .get(deleteOrUpdateAllAdminNotifications);

router
  .route("/:adminNotificationId")
  .get(getAllAdminNotification)
  .delete(deleteAdminNotification)
  .patch(updateAdminNotification);

module.exports = router;
