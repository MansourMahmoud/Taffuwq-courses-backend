const asyncWrapper = require("../../middleware/asyncWrapper");
const TeacherNotification = require("../../models/teacherNotification.model");
const Teacher = require("../../models/teacher.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const deleteOrUpdateAllTeacherNotifications = asyncWrapper(
  async (req, res, next) => {
    const { teacherId } = req.params;
    const { seen, deleteAll } = req.query;
    console.log(teacherId);
    const teacherNotification = await Teacher.findOne({
      _id: teacherId,
    });

    if (!teacherNotification) {
      const err = appError.create("owner not found", 400, FAIL);
      return next(err);
    }

    if (seen === "all") {
      await TeacherNotification.updateMany(
        { teacherId },
        { $set: { seen: true } }
      );

      const updateTeacherNotification = await TeacherNotification.find({
        teacherId,
      });

      return res.status(200).json({
        status: SUCCESS,
        message: "teacherNotifications has been updated successfully",
        data: { teacherNotifications: updateTeacherNotification },
      });
    } else if (deleteAll === "all") {
      await TeacherNotification.deleteMany({ teacherId });

      const deletedTeacherNotifications = await TeacherNotification.find({
        teacherId,
      });

      return res.status(200).json({
        status: SUCCESS,
        message: "teacherNotifications has been deleted successfully",
        data: { teacherNotifications: deletedTeacherNotifications },
      });
    }
  }
);

const getAllTeacherNotification = asyncWrapper(async (req, res, next) => {
  const { teacherNotificationId } = req.params;

  const teacherNotifications = await TeacherNotification.find(
    {
      teacherId: teacherNotificationId,
    },
    { __v: false }
  );

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { teacherNotifications },
  });
});

const updateTeacherNotification = asyncWrapper(async (req, res, next) => {
  const { teacherNotificationId } = req.params;
  const reqBody = req.body;

  const teacherNotification = await TeacherNotification.findById({
    _id: teacherNotificationId,
  });

  if (!teacherNotification) {
    const err = appError.create("teacherNotification not found", 400, FAIL);
    return next(err);
  }

  await TeacherNotification.updateOne(
    { _id: teacherNotificationId },
    { $set: reqBody }
  );

  const updateTeacherNotification = await TeacherNotification.findOne({
    _id: teacherNotificationId,
  });

  return res.status(200).json({
    status: SUCCESS,
    message: "teacherNotification has been updated successfully",
    data: { teacherNotification: updateTeacherNotification },
  });
});

const deleteTeacherNotification = asyncWrapper(async (req, res, next) => {
  const { teacherNotificationId } = req.params;

  const teacherNotification = await TeacherNotification.findById({
    _id: teacherNotificationId,
  });

  if (!teacherNotification) {
    const err = appError.create("teacherNotification not found", 400, FAIL);
    return next(err);
  }

  await TeacherNotification.deleteOne({ _id: teacherNotification });

  return res.status(200).json({
    status: SUCCESS,
    message: "teacher notification has been deleted successfully",
  });
});

module.exports = {
  getAllTeacherNotification,
  deleteTeacherNotification,
  updateTeacherNotification,
  deleteOrUpdateAllTeacherNotifications,
};
