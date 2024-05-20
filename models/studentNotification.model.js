const mongoose = require("mongoose");

const studentNotificationSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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

studentNotificationSchema.index({ createdAt: -1 });

const studentNotification = mongoose.model(
  "StudentNotification",
  studentNotificationSchema
);

module.exports = studentNotification;
