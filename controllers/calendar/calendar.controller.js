const asyncWrapper = require("../../middleware/asyncWrapper");

const { Exam } = require("../../models/exam.model");
const OrderCourse = require("../../models/orderCourse");
const StudentHomework = require("../../models/studentHomework.model");
const Homework = require("../../models/homework.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const getAllExamsForCalendar = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;

  // العثور على جميع الدورات التدريبية الخاصة بالطالب المحدد
  const orderCourses = await OrderCourse.find({ studentId });

  // استخراج courseIds للمعلمين بدون تكرار
  const courseIds = [
    ...new Set(
      orderCourses.flatMap((order) =>
        order.courses.map((course) => course.courseId)
      )
    ),
  ];

  // العثور على جميع الامتحانات الخاصة بالمعلمين المستخرجين
  const exams = await Exam.find({ teacherId: { $in: courseIds } }).populate(
    "teacherId"
  );

  res.status(200).json({
    status: SUCCESS,
    message: "Fetch successful",
    data: { exams },
  });
});
const getAllHomeworksForCalendar = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;

  const orderCourses = await OrderCourse.find({ studentId });
  const courseIds = [
    ...new Set(
      orderCourses.flatMap((order) =>
        order.courses.map((course) => course.courseId)
      )
    ),
  ];

  const homeworks = await Homework.find({
    teacherId: { $in: courseIds },
  }).populate("teacherId");
  const studentHomeworks = await StudentHomework.find({ studentId })
    .populate("teacherId")
    .populate("homeworkId");

  res.status(200).json({
    status: SUCCESS,
    message: "Fetch successful",
    data: { homeworks, studentHomeworks },
  });
});

module.exports = {
  getAllExamsForCalendar,
  getAllHomeworksForCalendar,
};
