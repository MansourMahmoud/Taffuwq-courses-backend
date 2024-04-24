const mongoose = require("mongoose");

const adminNotificationSchema = mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
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

adminNotificationSchema.index({ createdAt: -1 });

const adminNotification = mongoose.model(
  "AdminNotification",
  adminNotificationSchema
);

module.exports = adminNotification;
