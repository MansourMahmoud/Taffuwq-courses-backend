const asyncWrapper = require("../../middleware/asyncWrapper");
const StudentNotification = require("../../models/studentNotification.model");
const Student = require("../../models/student.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const deleteOrUpdateAllStudentNotifications = asyncWrapper(
  async (req, res, next) => {
    const { studentId } = req.params;
    const { seen, deleteAll } = req.query;

    const studentNotification = await Student.findOne({
      _id: studentId,
    });

    if (!studentNotification) {
      const err = appError.create("owner not found", 400, FAIL);
      return next(err);
    }

    if (seen === "all") {
      await StudentNotification.updateMany(
        { studentId },
        { $set: { seen: true } }
      );

      const updateStudentNotification = await StudentNotification.find({
        studentId,
      });

      return res.status(200).json({
        status: SUCCESS,
        message: "studentNotifications has been updated successfully",
        data: { studentNotifications: updateStudentNotification },
      });
    } else if (deleteAll === "all") {
      await StudentNotification.deleteMany({ studentId });

      const deletedStudentNotifications = await StudentNotification.find({
        studentId,
      });

      return res.status(200).json({
        status: SUCCESS,
        message: "studentNotifications has been deleted successfully",
        data: { studentNotifications: deletedStudentNotifications },
      });
    }
  }
);

const getAllStudentNotification = asyncWrapper(async (req, res, next) => {
  const { studentNotificationId } = req.params;

  const studentNotifications = await StudentNotification.find(
    {
      studentId: studentNotificationId,
    },
    { __v: false }
  );

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { studentNotifications },
  });
});

const updateStudentNotification = asyncWrapper(async (req, res, next) => {
  const { studentNotificationId } = req.params;
  const reqBody = req.body;

  const studentNotification = await StudentNotification.findById({
    _id: studentNotificationId,
  });

  if (!studentNotification) {
    const err = appError.create("studentNotification not found", 400, FAIL);
    return next(err);
  }

  await StudentNotification.updateOne(
    { _id: studentNotificationId },
    { $set: reqBody }
  );

  const updateStudentNotification = await StudentNotification.findOne({
    _id: studentNotificationId,
  });

  return res.status(200).json({
    status: SUCCESS,
    message: "studentNotification has been updated successfully",
    data: { studentNotification: updateStudentNotification },
  });
});

const deleteStudentNotification = asyncWrapper(async (req, res, next) => {
  const { studentNotificationId } = req.params;

  const studentNotification = await StudentNotification.findById({
    _id: studentNotificationId,
  });

  if (!studentNotification) {
    const err = appError.create("studentNotification not found", 400, FAIL);
    return next(err);
  }

  await StudentNotification.deleteOne({ _id: studentNotification });

  return res.status(200).json({
    status: SUCCESS,
    message: "student notification has been deleted successfully",
  });
});

module.exports = {
  getAllStudentNotification,
  deleteStudentNotification,
  updateStudentNotification,
  deleteOrUpdateAllStudentNotifications,
};
