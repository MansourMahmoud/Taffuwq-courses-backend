const asyncWrapper = require("../../middleware/asyncWrapper");
const Student = require("../../models/student.model");
const { SUCCESS } = require("../../utils/httpStatusText");

const studentSearch = asyncWrapper(async (req, res, next) => {
  const { search } = req.body;

  const query = new RegExp(search, "i", "g");

  const students = await Student.find({
    $or: [{ fullName: query }, { email: query }],
  }).select("-status -__v -idNum");

  return res.status(200).json({
    success: SUCCESS,
    data: { students },
    message: "all students",
  });
});

module.exports = studentSearch;
