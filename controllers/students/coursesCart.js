const asyncWrapper = require("../../middleware/asyncWrapper");
const Student = require("../../models/student.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");
const Cart = require("../../models/cart.model");

const getAllCoursesInCart = asyncWrapper(async (req, res, next) => {
  const studentId = req.params.studentId;

  const student = await Student.findById({ _id: studentId });

  if (!student) {
    const error = appError.create("student not found", 400, FAIL);
    return next(error);
  }

  const cart = await Cart.find({ studentId });

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successful",
    data: { cart },
  });
});

const addCourseInCart = asyncWrapper(async (req, res, next) => {
  const { course, studentId, work } = req.body;

  const student = await Student.findById({ _id: studentId });

  if (!student) {
    const error = appError.create("Invalid studentId", 400, FAIL);
    return next(error);
  } else if (!course) {
    const error = appError.create("course key must be an Object", 400, FAIL);
    return next(error);
  }

  // if course exist

  const findCourse = await Cart.findOne({ courseId: course._id });

  if (findCourse) {
    if (!work) {
      const incrementValue = 1;

      const updatedCourseInCart = await Cart.updateOne(
        { courseId: course._id },
        { $inc: { "course.quantity": incrementValue } },
        { new: true }
      );

      const courseUpdated = await Cart.findOne({ courseId: course._id });

      return res.status(200).json({
        status: SUCCESS,
        message: "course has been incremented successfully in cart",
        data: { course: courseUpdated },
      });
    } else {
      const decrementValue =
        work === "decrement"
          ? findCourse.course.quantity > 1
            ? -1
            : 0
          : work === "increment"
          ? 1
          : "no";

      if (decrementValue === "no") {
        const error = appError.create(
          "work key should be just decrement or increment.",
          400,
          FAIL
        );
        return next(error);
      } else {
        const updatedCourseInCart = await Cart.updateOne(
          { courseId: course._id },
          { $inc: { "course.quantity": decrementValue } },
          { new: true }
        );

        const courseUpdated = await Cart.findOne({ courseId: course._id });

        return res.status(200).json({
          status: SUCCESS,
          message: "course has been updated successfully",
          data: { course: courseUpdated },
        });
      }
    }
  } else {
    const newProductInCart = await new Cart({
      studentId,
      course,
      courseId: course._id,
    });

    await newProductInCart.save();

    return res.status(201).json({
      status: SUCCESS,
      message: "course successfully stored in cart",
      data: { course: newProductInCart },
    });
  }
});

const deleteCourseInCart = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;

  // if id ===  user,  then reset cart

  let allCoursesInCart = await Cart.find({ studentId: id });

  if (allCoursesInCart?.length > 0) {
    await Cart.deleteMany({ studentId: id });

    return res.status(200).json({
      status: SUCCESS,
      message: "courses have been deleted successfully",
      data: { courses: null },
    });
  }

  // if id === course _id , then delete this course in the student cart
  const course = await Cart.findById({ _id: id });

  if (!course) {
    const error = appError.create("course not found", 400, FAIL);
    return next(error);
  }

  await Cart.deleteOne({ _id: id });

  return res.status(200).json({
    status: SUCCESS,
    message: "course has been deleted successfully",
    data: { course: null },
  });
});

module.exports = {
  addCourseInCart,
  deleteCourseInCart,
  getAllCoursesInCart,
};
