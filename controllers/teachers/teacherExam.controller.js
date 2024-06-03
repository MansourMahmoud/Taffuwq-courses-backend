const asyncWrapper = require("../../middleware/asyncWrapper");
const { Exam, Question, Option } = require("../../models/exam.model");
const Teacher = require("../../models/teacher.model");
const Student = require("../../models/student.model");
const StudentNotification = require("../../models/studentNotification.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");
const storage = require("../../helpers/firebase");
const {
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const { v4 } = require("uuid");

const getAllExams = asyncWrapper(async (req, res, next) => {
  const { teacherId } = req.params;
  const options = {
    select: "-__v", // لإخفاء الحقل __v
    page: parseInt(req.query.page) || 1, // الصفحة الحالية (الافتراضي الصفحة 1)
    limit: parseInt(req.query.limit) || 5, // عدد العناصر في كل صفحة (الافتراضي 5)
    sort: { createdAt: -1 }, // ترتيب حسب updatedAt تنازليًا
  };

  const exams = await Exam.paginate({ teacherId }, options);

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { exams },
  });
});

const getSingleExam = asyncWrapper(async (req, res, next) => {
  const { examId } = req.params;

  const exam = await Exam.findById({ _id: examId }, { __v: false });

  if (!exam) {
    const err = appError.create("exam not found", 400, FAIL);
    return next(err);
  }

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { exam },
  });
});

const addExam = asyncWrapper(async (req, res, next) => {
  const reqBody = req.body;

  // معالجة ملفات الاختيارات
  for (const [indexQuestion, question] of reqBody.questions.entries()) {
    const fieldName = `questions[${indexQuestion}]questionImage`;

    if (req.files.some((file) => file.fieldname === fieldName)) {
      console.log("Question Image found");
      const file = req.files.find((file) => file.fieldname === fieldName);

      const ex = file.mimetype.split("/").pop();
      let exName = file.originalname.split(`.${ex}`)[1];

      const questionImageRef = ref(
        storage,
        `questions-images/${exName + v4() + "." + ex}`
      );

      const metadata = {
        contentType: file.mimetype,
      };

      const snapshot = await uploadBytesResumable(
        questionImageRef,
        file.buffer,
        metadata
      );

      const downloadURL = await getDownloadURL(snapshot.ref);

      req.body.questions = reqBody.questions?.map((item, index) => {
        if (index === indexQuestion) {
          return (item = { ...item, questionImage: downloadURL });
        } else {
          return (item = { ...item, questionImage: null });
        }
      });
    }
  }

  // معالجة ملفات الاختيارات
  for (const [indexQuestion, question] of reqBody.questions.entries()) {
    for (const [indexOption, option] of question.options.entries()) {
      const fieldName = `questions[${indexQuestion}][options][${indexOption}]optionImage`;

      if (req.files.some((file) => file.fieldname === fieldName)) {
        console.log("option Image found");

        const file = req.files.find((file) => file.fieldname === fieldName);
        // ... (معالجة ملف صورة الخيار)
        const ex = file.mimetype.split("/").pop();
        let exName = file.originalname.split(`.${ex}`)[1];

        const optionsImageRef = ref(
          storage,
          `options-images/${exName + v4() + "." + ex}`
        );

        const metadata = {
          contentType: file.mimetype,
        };

        const snapshot = await uploadBytesResumable(
          optionsImageRef,
          file.buffer,
          metadata
        );

        const downloadURL = await getDownloadURL(snapshot.ref);

        reqBody.questions[0].options = reqBody.questions[0].options?.map(
          (item, index) => {
            if (index === indexQuestion) {
              return (item = { ...item, optionImage: downloadURL });
            } else {
              return (item = { ...item, optionImage: null });
            }
          }
        );
      }
    }
  }

  const exam = new Exam({ ...reqBody });

  const questionsArr = [];

  // إنشاء كائنات الأسئلة والخيارات
  for (const q of reqBody.questions) {
    const question = new Question({
      content: q.content,
      questionImage: q.questionImage,
      notes: q.notes,
      options: q.options.map((opt) => ({
        text: opt.text,
        optionImage: opt.optionImage,
        questionId: "",
      })),
      correctOptionIndex: q.correctOptionIndex,
      examId: exam._id.toString(), // تعيين examId هنا
    });
    question.options.map((opt) => {
      opt.questionId = question._id.toString();
    });

    await question.save();
    // إنشاء كائنات الخيارات
    for (const o of question.options) {
      const option = new Option({
        text: o.text,
        optionImage: o.optionImage,
        questionId: question._id, // تعيين questionId لكل خيار
      });
      await option.save();
    }
    questionsArr.push(question);
  }
  exam.questions = questionsArr;

  await exam.save();

  const teahcer = await Teacher.findById(reqBody.teacherId);

  const studentsIds = teahcer.studentsIds;

  const newNotificationForStudents = studentsIds?.map(async (id) => {
    const pushNewNotificationForStudent = new StudentNotification({
      studentId: id,
      content: `المعلم ${teahcer.fullName} قد رفع امتحاناً من أجلك رجاء افحص التقويم!`,
    });
    await pushNewNotificationForStudent.save();
  });

  return res.status(201).json({
    status: SUCCESS,
    message: "exam has been added successfully",
    data: { exam },
  });
});

const updateExam = asyncWrapper(async (req, res, next) => {
  const { examId } = req.params;
  const reqBody = req.body;

  // العثور على الامتحان باستخدام معرف الامتحان
  const exam = await Exam.findById(examId);

  if (!exam) {
    const err = appError.create("exam not found", 400, FAIL);
    return next(err);
  }

  // تحديث الامتحان باستخدام findOneAndUpdate و upsert: true
  const updatedExam = await Exam.findOneAndUpdate(
    { _id: examId },
    { $push: { studentExitStatus: reqBody.studentExitStatus } }, // استخدم $push مباشرةً
    { upsert: true, new: true }
  );

  // إرجاع البيانات المحدثة فقط بدون الحاجة إلى طلب إضافي لقاعدة البيانات
  return res.status(200).json({
    status: SUCCESS,
    message: "exam has been updated successfully",
    data: { exam: updatedExam },
  });
});

const deleteExam = asyncWrapper(async (req, res, next) => {
  const { adId } = req.params;

  const ad = await Ad.findById({ _id: adId });

  if (!ad) {
    const err = appError.create("ad not found", 400, FAIL);
    return next(err);
  }

  await Ad.deleteOne({ _id: adId });

  return res.status(200).json({
    status: SUCCESS,
    message: "ad has been deleted successfully",
  });
});

module.exports = {
  getAllExams,
  addExam,
  getSingleExam,
  deleteExam,
  updateExam,
};
