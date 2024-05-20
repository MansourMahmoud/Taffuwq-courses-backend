const asyncWrapper = require("../../middleware/asyncWrapper");
const Student = require("../../models/student.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const getSingleStudent = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;

  const student = await Student.findById(
    { _id: studentId },
    { __v: false, password: false, token: false }
  );

  if (!student) {
    const err = appError.create("student not found", 400, FAIL);
    return next(err);
  }

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { student },
  });
});

const updateStudent = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;
  const reqBody = req.body;

  // تحديث الطالب باستخدام findOneAndUpdate و upsert: true
  const updatedStudent = await Student.findOneAndUpdate(
    { _id: studentId },
    { $push: { informationsOfExams: reqBody.informationsOfExams } }, // استخدم $push مباشرةً
    { upsert: true, new: true }
  );

  // إرجاع البيانات المحدثة فقط بدون الحاجة إلى طلب إضافي لقاعدة البيانات
  return res.status(200).json({
    status: SUCCESS,
    message: "student has been updated successfully",
    data: { student: updatedStudent },
  });
});
module.exports = {
  getSingleStudent,
  updateStudent,
};
