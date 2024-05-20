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
router.route("/").post(upload.any(), addExam);

router.route("/:teacherId").get(getAllExams);
router
  .route("/:examId")

  .get(getSingleExam)
  .delete(deleteExam)
  .patch(updateExam);

module.exports = router;
