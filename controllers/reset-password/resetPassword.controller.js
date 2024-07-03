const sendMail = require("../../emails/sendMail");
const asyncWrapper = require("../../middleware/asyncWrapper");
const Teacher = require("../../models/teacher.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");
const { randomDigits } = require("../../utils/randomDigits");
const bcrypt = require("bcryptjs");
const TeacherNotification = require("../../models/teacherNotification.model");

const checkEmail = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  const teacher = await Teacher.findOne({ email });

  if (!teacher) {
    const err = appError.create("teacher not found", 400, FAIL);
    return next(err);
  }
  console.log("teacher:", teacher);
  const code = randomDigits(6);
  const text = `
    <p>رمز التحقق الخاص بك لإعادة تعيين كلمة السر هو ${code}</p>
    `;
  sendMail(email, text);
  teacher.verificationCode = code;
  await teacher.save();
  return res.status(200).json({
    status: SUCCESS,
    message: "email has been sended!",
  });
});

const verifyCode = asyncWrapper(async (req, res, next) => {
  const { email, code } = req.body;
  const teacher = await Teacher.findOne({ email });

  if (!teacher) {
    const err = appError.create("teacher not found", 400, FAIL);
    next(err);
  }

  if (teacher?.verificationCode === code) {
    teacher.verificationCode = "";
    await teacher.save();

    return res.status(200).json({
      status: SUCCESS,
      message: "teacher has been verified!",
    });
  }
  const err = appError.create("code invalid", 400, FAIL);
  next(err);
});
const resetPass = asyncWrapper(async (req, res, next) => {
  const { password, email } = req.body;

  const teacher = await Teacher.findOne({ email });

  if (!teacher) {
    const err = appError.create("teacher not found", 400, FAIL);
    next(err);
  }

  teacher.password = await bcrypt.hash(password, 8);

  await teacher.save();

  const newNotificationForTeacher = new TeacherNotification({
    teacherId: teacher._id,
    content: `لقد قمت بإعادة تعيين كلمة السر الخاصة بك بنجاح!`,
  });

  await newNotificationForTeacher.save();

  return res.status(200).json({
    status: SUCCESS,
    message: "the password of teacher has been updated",
  });
});

module.exports = {
  verifyCode,
  resetPass,
  checkEmail,
};
