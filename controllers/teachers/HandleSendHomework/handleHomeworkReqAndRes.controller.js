const asyncWrapper = require("../../../middleware/asyncWrapper");
const Homework = require("../../../models/homework.model");
const Teacher = require("../../../models/teacher.model");
const StudentNotification = require("../../../models/studentNotification.model");
const Student = require("../../../models/student.model");
const StudentHomework = require("../../../models/studentHomework.model");
const appError = require("../../../utils/appError");
const { SUCCESS, FAIL } = require("../../../utils/httpStatusText");

// handle homework req and res

const sendHomeworkFromStudentReq = asyncWrapper(async (req, res, next) => {
  const { studentId, homeworkId, submittedFileUrl, teacherId } = req.body;
  const studentHomework = new StudentHomework({
    studentId,
    homeworkId,
    submittedFileUrl,
    teacherId,
  });
  await studentHomework.save();
  res
    .status(201)
    .json({ message: "Homework submitted successfully", studentHomework });
});

const updateTeacherResponse = asyncWrapper(async (req, res, next) => {
  const { homeworkId } = req.params;
  const { responseFileUrl, notes } = req.body;

  const updatedHomework = await StudentHomework.findOneAndUpdate(
    { homeworkId },
    {
      $set: {
        "teacherResponse.responseFileUrl": responseFileUrl,
        "teacherResponse.notes": notes,
        "teacherResponse.respondedAt": new Date(),
      },
    },
    { new: true }
  );

  if (!updatedHomework) {
    return res.status(404).json({ message: "Homework not found" });
  }

  res.status(200).json({ homework: updatedHomework });
});
const getHomeworkDetails = asyncWrapper(async (req, res, next) => {
  const { homeworkId } = req.params;
  const { studentId } = req.query;

  const homework = await Homework.findById(homeworkId);
  if (!homework) {
    return res.status(404).json({ error: "Homework not found" });
  }

  const studentHomework = await StudentHomework.findOne({
    homeworkId,
    studentId,
  });

  res.status(200).json({ homework, studentHomework });
});
const getHomeworkDetailsForTeacher = asyncWrapper(async (req, res, next) => {
  const { teacherId } = req.params;

  const studentHomework = await StudentHomework.find({
    teacherId,
  })
    .populate("homeworkId")
    .populate("studentId")
    .sort({ updatedAt: -1 });

  res.status(200).json({ homework: studentHomework });
});

module.exports = {
  sendHomeworkFromStudentReq,
  updateTeacherResponse,
  getHomeworkDetails,
  getHomeworkDetailsForTeacher,
};
