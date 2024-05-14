const asyncWrapper = require("../../middleware/asyncWrapper");
const Ad = require("../../models/ad.model");
const Student = require("../../models/student.model");
const Teacher = require("../../models/teacher.model");
const Cart = require("../../models/cart.model");
const OrderCourse = require("../../models/orderCourse");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const addOrder = asyncWrapper(async (req, res, next) => {
  const { courseId, course, studentId, courses, session_id, mode, total } =
    req.body; // افترض هنا أن الطالب متاح في طلب
  console.log(studentId);

  const isOrder = await OrderCourse.findOne({ orderId: session_id });

  if (!isOrder) {
    if (mode === "false" || mode === false) {
      const teacher = await Teacher.findById({ _id: courseId });

      const isStudent = teacher.studentsIds.find((student) => {
        return student.toString() === studentId;
      });
      console.log(studentId);
      if (!isStudent) {
        teacher.studentsIds = teacher.studentsIds.concat(studentId);
        console.log(teacher.studentsIds);

        teacher.totalSubscriptionPrices += total;
        await teacher.save();
      }

      const orderCourse = await OrderCourse.create({
        studentId: studentId,
        courses: [
          {
            studentId,
            course,
            courseId,
          },
        ],
        mode: "one course",
        orderId: session_id,
        teacherId: courseId,
      });
      console.log("orderCourse:", orderCourse);
      return res.status(201).json({
        status: SUCCESS,
        message: "order has been created!",
        data: {
          order: orderCourse,
        },
      });
    } else {
    }
  } else {
    const err = appError.create("order already exist", 400, FAIL);
    next(err);
  }
});
module.exports = { addOrder };
