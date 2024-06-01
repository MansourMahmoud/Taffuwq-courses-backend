const express = require("express");
const {
  getAllExamsForCalendar,
  getAllHomeworksForCalendar,
} = require("../controllers/calendar/calendar.controller");
const router = express.Router();

router.route("/exams/:studentId").get(getAllExamsForCalendar);
router.route("/homeworks/:studentId").get(getAllHomeworksForCalendar);

module.exports = router;
