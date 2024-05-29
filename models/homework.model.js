const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const homeworkSchema = mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      required: false,
    },
    homeworkFile: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

homeworkSchema.plugin(mongoosePaginate);

const Homework = mongoose.model("Homework", homeworkSchema);

module.exports = Homework;
