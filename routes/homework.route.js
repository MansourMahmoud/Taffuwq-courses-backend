const express = require("express");
const {
  getAllHomeworks,
  addHomework,
  getSingleHomework,
  deleteHomework,
  updateHomework,
} = require("../controllers/teachers/teacherHomework.controller");
const {
  sendHomeworkFromStudentReq,
  getHomeworkDetails,
  getHomeworkDetailsForTeacher,
  updateTeacherResponse,
} = require("../controllers/teachers/HandleSendHomework/handleHomeworkReqAndRes.controller");
const router = express.Router();

router.route("/").post(addHomework);
router.route("/req").post(sendHomeworkFromStudentReq);
router.route("/res/:homeworkId").patch(updateTeacherResponse);
router.route("/data/:homeworkId").get(getHomeworkDetails);
router.route("/data-for-teacher/:teacherId").get(getHomeworkDetailsForTeacher);

router.route("/:teacherId").get(getAllHomeworks);
router
  .route("/:homeworkId")

  .get(getSingleHomework)
  .delete(deleteHomework)
  .patch(updateHomework);

module.exports = router;
