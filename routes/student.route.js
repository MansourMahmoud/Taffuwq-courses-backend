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
  getTeacherStudents,
  getAllStudents,
  getAllStudentsWithPaginate,
  searchInStudents,
  getSingleStudentForExamScoure,
} = require("../controllers/students/student.controller");
const {
  addCourseInCart,
  deleteCourseInCart,
  getAllCoursesInCart,
} = require("../controllers/students/coursesCart");
const {
  getAllCoursesToJSON,
  searchInCoursesToJSON,
} = require("../controllers/courses/getAllCourses.controller");
const studentSearch = require("../controllers/students/studentSearch");

router.route("/register").post(upload.single("avatar"), studentRegistration);
router.route("/verify").post(verifyStudent);

router.route("/login").post(studentLogin);
router.route("/search").post(studentSearch);

// cart routes
router.route("/cart").post(addCourseInCart);
router.route("/cart/:id").delete(deleteCourseInCart);
router.route("/cart/:studentId").get(getAllCoursesInCart);
// end
// handle courses
router.route("/courses/search/:studentId").get(searchInCoursesToJSON);
router.route("/courses/:studentId").get(getAllCoursesToJSON);

router.route("/all-student-with-paginate").get(getAllStudentsWithPaginate);
router.route("/search").get(searchInStudents);
router.route("/exams-scoure/:studentId").get(getSingleStudentForExamScoure);
router.route("/").get(getAllStudents).post(getTeacherStudents);
router.route("/:studentId").get(getSingleStudent).patch(updateStudent);

module.exports = router;
