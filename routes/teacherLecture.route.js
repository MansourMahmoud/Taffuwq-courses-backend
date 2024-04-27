const express = require("express");
const {
  addTeacherLecture,
  getAllTeachersLectures,
  getSingleTeacherLecture,
  deleteTeacherLecture,
  updateTeacherLecture,
} = require("../controllers/teachers/teacherLecture.controller");
const uploadTeacherLecture = require("../middleware/uploadTeacherLectureFiles");
const router = express.Router();

router
  .route("/")
  .get(getAllTeachersLectures)
  .post(
    uploadTeacherLecture.fields([
      { name: "lectureVideo", maxCount: 1 },
      { name: "lectureAttachments", maxCount: 5 },
    ]),
    addTeacherLecture
  );

router
  .route("/:teacherLectureId")
  .get(getSingleTeacherLecture)
  .delete(deleteTeacherLecture)
  .patch(updateTeacherLecture);

module.exports = router;
