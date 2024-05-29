const mongoose = require("mongoose");

const StudentHomeworkSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  homeworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Homework",
    required: true,
  },
  submittedFileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  teacherResponse: {
    responseFileUrl: { type: String },
    notes: { type: String },
    respondedAt: { type: Date },
  },
});

const StudentHomework = mongoose.model(
  "StudentHomework",
  StudentHomeworkSchema
);

module.exports = StudentHomework;
