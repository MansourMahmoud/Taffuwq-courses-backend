const express = require("express");
const {
  getAllExams,
  addExam,
  getSingleExam,
  deleteExam,
  updateExam,
} = require("../controllers/teachers/teacherExam.controller");
const router = express.Router();
const multer = require("multer");
const upload = multer();
router.route("/").get(getAllExams).post(upload.any(), addExam);

router
  .route("/:examId")
  .get(getSingleExam)
  .delete(deleteExam)
  .patch(updateExam);

module.exports = router;
