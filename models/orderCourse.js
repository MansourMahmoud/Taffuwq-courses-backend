const mongoose = require("mongoose");

const orderCourse = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  courses: [
    {
      type: Object,
      required: true,
    },
  ],
  mode: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
});

const OrderCourse = mongoose.model("OrderCourse", orderCourse);

module.exports = OrderCourse;
