const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const teacherLectureSchema = mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    lectureVideo: {
      type: String,
      required: true,
    },
    lectureTitle: {
      type: String,
      required: true,
      trim: true,
    },
    lectureDescription: {
      type: String,
      required: true,
      trim: true,
    },
    lectureAttachments: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

teacherLectureSchema.plugin(mongoosePaginate);

const teacherLecture = mongoose.model("TeacherLecture", teacherLectureSchema);

module.exports = teacherLecture;
