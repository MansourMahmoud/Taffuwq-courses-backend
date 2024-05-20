const express = require("express");

const router = express.Router();
const upload = require("../middleware/uploadImage");

const {
  verifyStudent,
  studentRegistration,
  studentLogin,
} = require("../controllers/auth/students/studentAuth.controller");
const {
  getSingleStudent,
  updateStudent,
} = require("../controllers/students/student.controller");
const {
  addCourseInCart,
  deleteCourseInCart,
  getAllCoursesInCart,
} = require("../controllers/students/coursesCart");
const {
  getAllCoursesToJSON,
} = require("../controllers/courses/getAllCourses.controller");

router.route("/register").post(upload.single("avatar"), studentRegistration);
router.route("/verify").post(verifyStudent);

router.route("/login").post(studentLogin);

// cart routes
router.route("/cart").post(addCourseInCart);
router.route("/cart/:id").delete(deleteCourseInCart);
router.route("/cart/:studentId").get(getAllCoursesInCart);
// end
// handle courses
router.route("/courses/:studentId").get(getAllCoursesToJSON);

router.route("/:studentId").get(getSingleStudent).patch(updateStudent);

module.exports = router;
