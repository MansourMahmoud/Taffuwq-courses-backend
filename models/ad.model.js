const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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
    timeFrom: {
      type: String,
      required: true,
      trim: true,
    },
    timeTo: {
      type: String,
      required: true,
      trim: true,
    },
    dayFrom: {
      type: String,
      required: true,
      trim: true,
    },
    dayTo: {
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
adSchema.plugin(mongoosePaginate);

const ad = mongoose.model("Ad", adSchema);

module.exports = ad;
