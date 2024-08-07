const express = require("express");
const cors = require("cors");
const { ERROR } = require("./utils/httpStatusText");
require("dotenv").config();
require("./DB/DBConnect");
const { app, server } = require("./socket/index");

// const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    credentials: true,
    origin: process.env.BASE_URL_FRONTEND || "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);

// import Router
const teachersRouter = require("./routes/teacher.route");
const ownersRouter = require("./routes/owner.route");
const adsRouter = require("./routes/ad.route");
const teachersLecturesRouter = require("./routes/teacherLecture.route");
const teachersExamsRouter = require("./routes/exam.route");
const teachersHomeworkRouter = require("./routes/homework.route");
const adminNotificationsRouter = require("./routes/adminNotification.route");
const teacherNotificationsRouter = require("./routes/teacherNotification.route");
const studentNotificationsRouter = require("./routes/studentNotification.route");
const studentNotes = require("./routes/note.route");
const studentsRouter = require("./routes/student.route");
const paymentRouter = require("./routes/payment.route");
const ordersRouter = require("./routes/order.route");
const calendarRouter = require("./routes/calendar.route");
const resetPasswordRouter = require("./routes/resetPassword.route");

// use Router
app.use("/api/v1/teachers/lectures", teachersLecturesRouter);
app.use("/api/v1/teachers/exams", teachersExamsRouter);
app.use("/api/v1/teachers/homework", teachersHomeworkRouter);
app.use("/api/v1/teachers/notifications", teacherNotificationsRouter);
app.use("/api/v1/teachers", teachersRouter);

app.use("/api/v1/owners/ads", adsRouter);
app.use("/api/v1/owners/notifications", adminNotificationsRouter);
app.use("/api/v1/owners", ownersRouter);

app.use("/api/v1/students/notifications", studentNotificationsRouter);
app.use("/api/v1/students/notes", studentNotes);
app.use("/api/v1/students", studentsRouter);
app.use("/api/v1/payment", paymentRouter);
//
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/calendar", calendarRouter);
app.use("/api/v1/reset-password", resetPasswordRouter);

// global middleware for not found router
app.all("*", (req, res) => {
  return res
    .status(404)
    .json({ status: ERROR, message: "this resource is not available" });
});

// global error handler
app.use((error, req, res, next) => {
  res.status(error.code || 500).json({
    status: error.statusText || ERROR,
    message: error.message,
    code: error.code || 500,
  });
});

server.listen(port || 8000, () => {
  console.log("listen on port:", port);
});
