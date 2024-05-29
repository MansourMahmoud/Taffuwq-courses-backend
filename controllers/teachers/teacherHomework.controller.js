const asyncWrapper = require("../../middleware/asyncWrapper");
const Homework = require("../../models/homework.model");
const Teacher = require("../../models/teacher.model");
const StudentNotification = require("../../models/studentNotification.model");
const Student = require("../../models/student.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const getAllHomeworks = asyncWrapper(async (req, res, next) => {
  const { teacherId } = req.params;

  const homeworks = await Homework.find({ teacherId }).sort({ updatedAt: -1 });
  res.status(200).json({ status: SUCCESS, data: { homeworks } });
});

const addHomework = asyncWrapper(async (req, res, next) => {
  const { title, startDate, endDate, notes, homeworkFile, teacherId } =
    req.body;

  const homework = new Homework({
    teacherId,
    title,
    startDate,
    endDate,
    notes,
    homeworkFile,
  });
  await homework.save();

  const teahcer = await Teacher.findById(teacherId);

  const studentsIds = teahcer.studentsIds;

  const newNotificationForStudents = studentsIds?.map(async (id) => {
    const pushNewNotificationForStudent = new StudentNotification({
      studentId: id,
      content: `المعلم ${teahcer.fullName} قد رفع واجبا من أجلك رجاء افحص التقويم!`,
    });
    await pushNewNotificationForStudent.save();
  });

  res.status(201).json({ status: SUCCESS, data: { homework } });
});

const getSingleHomework = asyncWrapper(async (req, res, next) => {
  const { homeworkId } = req.params;

  const homework = await Homework.findById(homeworkId);
  if (!homework) {
    return next(new appError("No homework found with that ID", 404));
  }

  res.status(200).json({ status: SUCCESS, data: { homework } });
});

const deleteHomework = asyncWrapper(async (req, res, next) => {
  const { homeworkId } = req.params;

  const homework = await Homework.findByIdAndDelete(homeworkId);
  if (!homework) {
    return next(new appError("No homework found with that ID", 404));
  }

  res.status(204).json({ status: SUCCESS, data: null });
});

const updateHomework = asyncWrapper(async (req, res, next) => {
  const { homeworkId } = req.params;
  const updates = req.body;

  const homework = await Homework.findByIdAndUpdate(homeworkId, updates, {
    new: true,
    runValidators: true,
  });

  if (!homework) {
    return next(new appError("No homework found with that ID", 404));
  }

  res.status(200).json({ status: SUCCESS, data: { homework } });
});

module.exports = {
  getAllHomeworks,
  addHomework,
  getSingleHomework,
  deleteHomework,
  updateHomework,
};
