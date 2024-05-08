const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const validator = require("validator");
const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  optionImage: {
    type: String, // يمكنك تخزين رابط الصورة كنص
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
});

// تعريف نموذج السؤال
const questionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  questionImage: {
    type: String,
  },

  options: {
    type: [optionSchema],
    validate: {
      validator: function (value) {
        // التحقق من أن مصفوفة الخيارات غير فارغة
        return value.length === 4;
      },
      message: "يجب إضافة 4 خيارات على الأقل للسؤال",
    },
    required: true,
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
  },
  correctOptionIndex: {
    type: Number,
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
});

const answerSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  questionId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
  ],
  selectedOptionIndex: [
    {
      type: Number,
      required: true,
    },
  ],
});

// تعريف نموذج الامتحان
const examSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  studentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  ],
  titleOfExam: {
    type: String,
    required: true,
  },
  descriptionOfExam: {
    type: String,
    required: true,
  },
  timeOfExam: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  questions: [questionSchema],
  numOfQuestions: {
    type: String,
    required: true,
  },
  totalScores: {
    type: String,
    required: true,
  },
  scoreOfEachQuestion: {
    type: String,
    required: true,
  },
  answers: [answerSchema],
  studentScores: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
    },
  ],
});
optionSchema.plugin(mongoosePaginate);
questionSchema.plugin(mongoosePaginate);
answerSchema.plugin(mongoosePaginate);
examSchema.plugin(mongoosePaginate);

// تصدير النماذج

const Option = mongoose.model("Option", optionSchema);
const Question = mongoose.model("Question", questionSchema);
const Answer = mongoose.model("Answer", answerSchema);
const Exam = mongoose.model("Exam", examSchema);

module.exports = { Option, Question, Answer, Exam };
