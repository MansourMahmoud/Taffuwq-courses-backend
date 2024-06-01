const asyncWrapper = require("../../middleware/asyncWrapper");
const Student = require("../../models/student.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const getAllStudents = asyncWrapper(async (req, res, next) => {
  const students = await Student.find(
    {},
    { __v: false, password: false, token: false }
  );

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { students },
  });
});

const searchInStudents = asyncWrapper(async (req, res, next) => {
  const { fullName, email, branch, nameOfSchool, age, idNum, gender } =
    req.query;

  const match = {};

  if (fullName) {
    match.fullName = { $regex: fullName, $options: "i" };
  }

  if (email) {
    match.email = { $regex: email, $options: "i" };
  }

  if (branch) {
    match.branch = { $regex: branch, $options: "i" };
  }

  if (nameOfSchool) {
    match.nameOfSchool = { $regex: nameOfSchool, $options: "i" };
  }

  if (age) {
    match.age = Number(age);
  }

  if (idNum) {
    match.idNum = Number(idNum);
  }

  if (gender) {
    match.gender = gender;
  }

  const students = await Student.find(match, {
    __v: false,
    password: false,
    token: false,
  });

  res.status(200).json({
    status: "SUCCESS",
    data: { students },
  });
});

const getAllStudentsWithPaginate = asyncWrapper(async (req, res, next) => {
  const options = {
    select: { __v: false, password: false, token: false },
    page: parseInt(req.query.page) || 1, // الصفحة الحالية (الافتراضي الصفحة 1)
    limit: parseInt(req.query.limit) || 5, // عدد العناصر في كل صفحة (الافتراضي 5)
  };

  const students = await Student.paginate({}, options);

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { students },
  });
});

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

const getTeacherStudents = asyncWrapper(async (req, res, next) => {
  const { ids, fullName, email, branch, nameOfSchool, age, idNum, gender } =
    req.body;

  const match = { _id: { $in: ids } };

  if (fullName) {
    match.fullName = { $regex: fullName, $options: "i" };
  }

  if (email) {
    match.email = { $regex: email, $options: "i" };
  }

  if (branch) {
    match.branch = { $regex: branch, $options: "i" };
  }

  if (nameOfSchool) {
    match.nameOfSchool = { $regex: nameOfSchool, $options: "i" };
  }

  if (age) {
    match.age = Number(age);
  }

  if (idNum) {
    match.idNum = Number(idNum);
  }

  if (gender) {
    match.gender = gender;
  }

  const students = await Student.find(match);

  res.status(200).json({
    status: "SUCCESS",
    message: "fetch is successfully",
    data: { students },
  });
});

const updateStudent = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;
  const reqBody = req.body;

  let updatedStudent;
  console.log("reqBody:", reqBody);

  if (reqBody.informationsOfExams) {
    updatedStudent = await Student.findOneAndUpdate(
      { _id: studentId },
      { $push: { informationsOfExams: reqBody.informationsOfExams } },
      { upsert: true, new: true }
    );
  } else {
    updatedStudent = await Student.findOneAndUpdate(
      { _id: studentId },
      { $set: { ...reqBody } },
      { new: true }
    );
  }

  console.log("updatedStudent in student.controller:", updatedStudent);

  return res.status(200).json({
    status: "SUCCESS",
    message: "student has been updated successfully",
    data: { student: updatedStudent },
  });
});
module.exports = {
  getSingleStudent,
  updateStudent,
  getTeacherStudents,
  getAllStudents,
  getAllStudentsWithPaginate,
  searchInStudents,
};
