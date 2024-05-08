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

module.exports = {
  getSingleStudent,
};
