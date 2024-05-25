const jwt = require("jsonwebtoken");
const Student = require("../models/student.model");

const getStudentDetailsFromToken = async (token) => {
  if (!token) {
    return {
      message: "token not found",
    };
  }
  const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  const student = await Student.findById({ _id: decode.id });
  return student;
};

module.exports = getStudentDetailsFromToken;
