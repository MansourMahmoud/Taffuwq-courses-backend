const asyncWrapper = require("../../middleware/asyncWrapper");
const Ad = require("../../models/ad.model");
const Student = require("../../models/student.model");
const Teacher = require("../../models/teacher.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const getAllCoursesToJSON = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;

  const student = await Student.findById({ _id: studentId });

  // الحصول على branch من الطالب
  const branch = student.branch;

  // البحث عن Ad و Teacher الذين لديهم branch يطابق branch من الطالب
  const ad = await Ad.find({ branch });
  const teacher = await Teacher.find({ branch, status: "accepted" });

  // دمج الإعلانات مع المدرسين
  const teachersWithAds = teacher.map((t) => {
    const teacherAd = ad.find((a) => a.course === t.course);
    return { ...t.toObject(), ad: teacherAd };
  });

  // تجميع النتائج في الـ courses
  const courses = {
    courses: teachersWithAds,
  };

  res.status(200).json({
    status: SUCCESS,
    data: courses,
  });
});

const searchInCoursesToJSON = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;
  const { fullName = "", course = "" } = req.query;

  const student = await Student.findById(studentId);
  const branch = student.branch;

  const ad = await Ad.find({ branch });
  const teacher = await Teacher.find({ branch, status: "accepted" }); // فقط المعلمين المقبولين

  const teachersWithAds = teacher.map((t) => {
    const teacherAd = ad.find((a) => a.course === t.course);
    return { ...t.toObject(), ad: teacherAd };
  });
  let courses = [];
  if (fullName || course) {
    const filteredCourses = teachersWithAds.filter(
      (teacherWithAd) =>
        teacherWithAd.fullName.toLowerCase().includes(fullName.toLowerCase()) &&
        teacherWithAd.course.toLowerCase().includes(course.toLowerCase())
    );
    courses = filteredCourses;
  }

  res.status(200).json({
    status: SUCCESS,
    data: { courses },
  });
});
module.exports = { getAllCoursesToJSON, searchInCoursesToJSON };
