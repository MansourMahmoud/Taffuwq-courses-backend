const mongoose = require("mongoose");

const adSchema = mongoose.Schema(
  {
    course: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

adSchema.index({ course: 1 });

const ad = mongoose.model("Ad", adSchema);

module.exports = ad;
