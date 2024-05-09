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
      enum: ["أدبي", "علمي", "تجاري"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    eduQualification: {
      type: String,
      required: true,
      trim: true,
    },
    courseImg: {
      type: String,
      required: true,
      trim: true,
    },
    priceOfCourse: {
      type: String,
      required: true,
      trim: true,
    },
    discount: {
      type: String,
      required: true,
      trim: true,
    },
    showDiscount: {
      type: Boolean,
      default: true,
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

adSchema.plugin(mongoosePaginate);

const ad = mongoose.model("Ad", adSchema);

module.exports = ad;
