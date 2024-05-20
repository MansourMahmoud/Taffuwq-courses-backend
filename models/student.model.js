const mongoose = require("mongoose");
const validator = require("validator");
const { STUDENT } = require("../utils/userRols");
const { male, female, Male, Female } = require("../utils/genderEnum");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { FAIL } = require("../utils/httpStatusText");
const appError = require("../utils/appError");
const statusEnum = require("../utils/status");

const studentSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("email must be a provided and an actual email");
        }
      },
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    fullName: {
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
    nameOfSchool: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: String,
      required: true,
      trim: true,
    },
    idNum: {
      type: Number,
      required: true,
      trim: true,
      unique: true, // جعل الحقل فريدًا
      validate: {
        validator: function (v) {
          // تحقق مما إذا كانت القيمة تحتوي على 9 أرقام
          return /^\d{9}$/.test(v.toString());
        },
        message: (props) => `${props.value} يجب أن يكون مكونًا من 9 أرقام فقط!`,
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
    },
    role: {
      type: String, // ['STUDENT']
      enum: [STUDENT],
      default: STUDENT,
    },
    gender: {
      type: String,
      required: true,
      enum: [male, female, Male, Female],
    },
    dateOfBirth: {
      type: String,
    },
    avatar: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: statusEnum,
      default: statusEnum.INACTIVE,
    },
    informationsOfExams: [
      {
        examId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exam",
          required: true,
        },
        totalScores: {
          type: Number,
          required: true,
        },
        answers: {
          type: Object,
          required: true,
        },
        attended: {
          type: Boolean,
          required: true,
          default: false,
        },
        attendanceTime: {
          type: Date,
          required: function () {
            return this.attended;
          }, // required if attended is true
        },
        duration: {
          type: Number, // مدة الامتحان بالدقائق
          required: function () {
            return this.attended;
          }, // required if attended is true
        },
      },
    ],
    verificationCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.statics.findByCredentials = async (idNum, password) => {
  const student = await Student.findOne({ idNum });

  if (!student) {
    throw appError.create("idNum or password is invalid", 400, FAIL);
  }

  const isMatch = await bcrypt.compare(password, student.password);

  if (!isMatch) {
    throw appError.create("idNum or password is invalid", 400, FAIL);
  }

  return student;
};

studentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

studentSchema.methods.generateAuthToken = async function () {
  const student = this;
  const token = jwt.sign(
    { id: student._id.toString(), email: student.email, role: student.role },
    process.env.JWT_SECRET_KEY
  );
  student.token = token;
  await student.save();
  return token;
};

studentSchema.methods.toJSON = function () {
  const student = this;
  const studentObject = student.toObject();

  delete studentObject.password;
  delete studentObject.token;

  return studentObject;
};

studentSchema.index({ fullName: 1 });

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
