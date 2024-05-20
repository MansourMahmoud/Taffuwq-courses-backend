const mongoose = require("mongoose");

const teacherNotificationSchema = mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

teacherNotificationSchema.index({ createdAt: -1 });

const teacherNotification = mongoose.model(
  "TeacherNotification",
  teacherNotificationSchema
);

module.exports = teacherNotification;
