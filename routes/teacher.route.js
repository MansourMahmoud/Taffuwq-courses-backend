const express = require("express");
const router = express.Router();
const {
  teacherRegistration,
  teacherLogin,
} = require("../controllers/auth/teachers/teacherAuth.controller");
const uploadTeacherCV = require("../middleware/uploadTeacherFiles");
const upload = require("../middleware/uploadImage");

const {
  changeTeacherStatus,
  setPassword,
  getSingleTeacher,
} = require("../controllers/teachers/teacher.controller");

const TeacherAuthentication = require("../middleware/TeacherAuthentication");
router.route("/register").post(
  uploadTeacherCV.fields([
    { name: "cv", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  teacherRegistration
);

router.route("/change-status").post(changeTeacherStatus);
router.route("/set-password").post(setPassword);
router.route("/login").post(teacherLogin);
router.route("/:teacherId").get(getSingleTeacher);

module.exports = router;
