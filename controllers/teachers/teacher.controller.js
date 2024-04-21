const asyncWrapper = require("../../middleware/asyncWrapper");
const Teacher = require("../../models/teacher.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");
const handleResMail = require("../../utils/handleResMail");
const sendMail = require("../../emails/sendMail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { accepted } = require("../../utils/statusEnum‎");

const changeTeacherStatus = asyncWrapper(async (req, res, next) => {
  const { email, teacherStatus } = req.body;

  const catchTeacher = await Teacher.findOne({ email });

  if (!catchTeacher) {
    const err = appError.create("teacher not found", 400, FAIL);
    next(err);
  }

  if (teacherStatus === "accepted") {
    const text = handleResMail(
      teacherStatus,
      catchTeacher.course,
      catchTeacher.branch,
      catchTeacher.token
    );
    const emailRes = await sendMail(email, text);
    return res.status(200).json({
      status: SUCCESS,
      message: emailRes,
    });
  } else if (teacherStatus === "refused") {
    const text = handleResMail(teacherStatus);
    const emailRes = await sendMail(email, text);
    return res.status(200).json({
      status: SUCCESS,
      message: emailRes,
    });
  } else {
    const err = appError.create("something wrong", 400, FAIL);
    next(err);
  }
});

const setPassword = asyncWrapper(async (req, res, next) => {
  const { password } = req.body;
  const { t } = req.query;

  const decode = jwt.verify(t, process.env.JWT_SECRET_KEY);

  const teacher = await Teacher.findOne({ _id: decode.id, token: t });

  if (!teacher) {
    const err = appError.create("teacher not found", 400, FAIL);
    next(err);
  }

  teacher.password = await bcrypt.hash(password, 8);
  teacher.status = accepted;

  await teacher.save();

  return res.status(200).json({
    status: SUCCESS,
    message: "The teacher is now ready to login.",
  });
});

const getSingleTeacher = asyncWrapper(async (req, res, next) => {
  const { teacherId } = req.params;

  const teacher = await Teacher.findById(
    { _id: teacherId },
    { __v: false, password: false, token: false }
  );

  if (!teacher) {
    const err = appError.create("teacher not found", 400, FAIL);
    return next(err);
  }

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { teacher },
  });
});

module.exports = { changeTeacherStatus, setPassword, getSingleTeacher };
