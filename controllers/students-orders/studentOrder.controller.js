const asyncWrapper = require("../../middleware/asyncWrapper");
const Ad = require("../../models/ad.model");
const Student = require("../../models/student.model");
const Teacher = require("../../models/teacher.model");
const Cart = require("../../models/cart.model");
const OrderCourse = require("../../models/orderCourse");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");
const TeacherNotification = require("../../models/teacherNotification.model");
const StudentNotification = require("../../models/studentNotification.model");

const addOrder = asyncWrapper(async (req, res, next) => {
  const { courseId, course, studentId, courses, session_id, mode, total } =
    req.body; // افترض هنا أن الطالب متاح في طلب

  const isOrder = await OrderCourse.findOne({ orderId: session_id });

  if (!isOrder) {
    if (mode === "false" || mode === false) {
      const teacher = await Teacher.findById({ _id: courseId });

      const isStudent = teacher.studentsIds.find((student) => {
        return student.toString() === studentId;
      });

      if (!isStudent) {
        teacher.studentsIds = teacher.studentsIds.concat(studentId);
        teacher.totalSubscriptionPrices = (
          +teacher.totalSubscriptionPrices + +total
        ).toString();
        await teacher.save();

        const orderCourse = new OrderCourse({
          studentId: studentId,
          courses: [
            {
              studentId,
              course: course,
              courseId,
            },
          ],
          mode: "one course",
          orderId: session_id,
          teacherId: courseId,
        });

        await orderCourse.save();

        const student = await Student.findById({ _id: studentId });

        const newNotificationForTeacher = new TeacherNotification({
          teacherId: teacher._id,
          content: `الطالب ${student.fullName} قد اشترك في دورتك`,
        });

        await newNotificationForTeacher.save();

        const newNotificationForStudent = new StudentNotification({
          studentId: student._id,
          content: `لقد اشتركت في دورة المعلم ${teacher.fullName} بمبلغ قدرة ${(
            +total + 20
          ).toString()} شيكيل`,
        });

        await newNotificationForStudent.save();

        return res.status(201).json({
          status: SUCCESS,
          message: "order has been created!",
          data: {
            order: orderCourse,
          },
        });
      } else {
        const err = appError.create(
          "Student is already registered for this course",
          400,
          FAIL
        );
        next(err);
      }
    } else if (mode === "true" || mode === true) {
      // التحقق من وجود الدورات في الطلب
      if (!courses || !courses.length) {
        const err = appError.create(
          "No courses provided in the request",
          400,
          FAIL
        );
        return next(err);
      }
      const student = await Student.findById({ _id: studentId });

      let totalOfPrice = 0;

      // تحديث السعر لكل معلم بناءً على الدورات في الطلب
      for (const course of courses) {
        const teacher = await Teacher.findOne({ _id: course.courseId });

        if (!teacher) {
          // يجب التعامل مع حالة عدم العثور على المعلم
          const err = appError.create(
            `Teacher not found with id: ${course.courseId}`,
            404,
            FAIL
          );
          return next(err);
        }

        const isStudent = teacher.studentsIds.find((student) => {
          return student.toString() === studentId;
        });

        if (!isStudent) {
          teacher.studentsIds = teacher.studentsIds.concat(studentId);

          // تحديث السعر للمعلم بناءً على سعر الدورة
          let coursePrice = course.course.ad.priceOfCourse;
          if (course.course.ad.showDiscount === true) {
            coursePrice = course.course.ad.discount;
          }
          totalOfPrice += +coursePrice;

          teacher.totalSubscriptionPrices = (
            +teacher.totalSubscriptionPrices + +coursePrice
          ).toString();
          await teacher.save();
        }

        const newNotificationForTeacher = new TeacherNotification({
          teacherId: teacher._id,
          content: `الطالب ${student.fullName} قد اشترك في دورتك`,
        });

        await newNotificationForTeacher.save();
      }

      // إنشاء الطلب بعد تحديث السعر لكل معلم
      const orderCourse = new OrderCourse({
        studentId: studentId,
        courses: courses.map((c) => ({
          studentId,
          course: c.course,
          courseId: c.courseId,
        })),
        mode: "multiple courses",
        orderId: session_id,
        teacherId: courses[0].courseId,
      });

      await orderCourse.save();

      const newNotificationForStudent = new StudentNotification({
        studentId: student._id,
        content: `لقد اشتركت في عدد ${
          courses?.length > 0 ? courses?.length : "0"
        } من الدورات بمبلغ وقدرة ${(totalOfPrice + 20).toString()}`,
      });

      await newNotificationForStudent.save();

      const deleteAllInCart = await Cart.deleteMany({ studentId });

      return res.status(201).json({
        status: SUCCESS,
        message: "order has been created!",
        data: {
          order: orderCourse,
        },
      });
    } else {
      const err = appError.create(
        "Student is already registered for this course",
        400,
        FAIL
      );
      next(err);
    }
  }
});

const getAllOrdersForSingleStudent = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;

  const ordersOfStudent = await OrderCourse.find({ studentId });

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully!",
    data: {
      orders: ordersOfStudent,
    },
  });
});
module.exports = { addOrder, getAllOrdersForSingleStudent };
