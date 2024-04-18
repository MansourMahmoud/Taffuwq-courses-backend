const jwt = require("jsonwebtoken");
const Teacher = require("../models/teacher.model");
const TeacherAuthentication = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const teacher = await Teacher.findOne({ _id: decode._id, token: token });
    if (!teacher) {
      throw new Error("No teacher found");
    }
    req.token = token;
    req.teacher = teacher;
    next();
  } catch (error) {
    res.status(401).send({ error: "please auth" });
  }
};

module.exports = TeacherAuthentication;
