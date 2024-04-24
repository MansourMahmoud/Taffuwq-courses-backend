const asyncWrapper = require("../../middleware/asyncWrapper");
const AdminNotification = require("../../models/adminNotification.model");
const Owner = require("../../models/owner.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const deleteOrUpdateAllAdminNotifications = asyncWrapper(
  async (req, res, next) => {
    const { ownerId } = req.params;
    const { seen, deleteAll } = req.query;
    console.log(ownerId);
    const adminNotification = await Owner.findOne({
      _id: ownerId,
    });

    if (!adminNotification) {
      const err = appError.create("owner not found", 400, FAIL);
      return next(err);
    }

    if (seen === "all") {
      await AdminNotification.updateMany({ ownerId }, { $set: { seen: true } });

      const updateAdminNotification = await AdminNotification.find({
        ownerId,
      });

      return res.status(200).json({
        status: SUCCESS,
        message: "adminNotifications has been updated successfully",
        data: { adminNotifications: updateAdminNotification },
      });
    } else if (deleteAll === "all") {
      await AdminNotification.deleteMany({ ownerId });

      const deletedAdminNotifications = await AdminNotification.find({
        ownerId,
      });

      return res.status(200).json({
        status: SUCCESS,
        message: "adminNotifications has been deleted successfully",
        data: { adminNotifications: deletedAdminNotifications },
      });
    }
  }
);

const getAllAdminNotification = asyncWrapper(async (req, res, next) => {
  const { adminNotificationId } = req.params;

  const adminNotifications = await AdminNotification.find(
    {
      ownerId: adminNotificationId,
    },
    { __v: false }
  );

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { adminNotifications },
  });
});

const updateAdminNotification = asyncWrapper(async (req, res, next) => {
  const { adminNotificationId } = req.params;
  const reqBody = req.body;

  const adminNotification = await AdminNotification.findById({
    _id: adminNotificationId,
  });

  if (!adminNotification) {
    const err = appError.create("adminNotification not found", 400, FAIL);
    return next(err);
  }

  await AdminNotification.updateOne(
    { _id: adminNotificationId },
    { $set: reqBody }
  );

  const updateAdminNotification = await AdminNotification.findOne({
    _id: adminNotificationId,
  });

  return res.status(200).json({
    status: SUCCESS,
    message: "adminNotification has been updated successfully",
    data: { adminNotification: updateAdminNotification },
  });
});

const deleteAdminNotification = asyncWrapper(async (req, res, next) => {
  const { adminNotificationId } = req.params;

  const adminNotification = await AdminNotification.findById({
    _id: adminNotificationId,
  });

  if (!adminNotification) {
    const err = appError.create("adminNotification not found", 400, FAIL);
    return next(err);
  }

  await AdminNotification.deleteOne({ _id: adminNotification });

  return res.status(200).json({
    status: SUCCESS,
    message: "admin notification has been deleted successfully",
  });
});

module.exports = {
  getAllAdminNotification,
  deleteAdminNotification,
  updateAdminNotification,
  deleteOrUpdateAllAdminNotifications,
};
