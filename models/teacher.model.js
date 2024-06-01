const mongoose = require("mongoose");
const validator = require("validator");
const { pending, accepted, refused } = require("../utils/statusEnum‎");
const { TEACHER } = require("../utils/userRols");
const { male, female, Male, Female } = require("../utils/genderEnum");
const mongoosePaginate = require("mongoose-paginate-v2");

const teacherSchema = mongoose.Schema(
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
      required: true,
      trim: true,
    },
    fullName: {
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
    course: {
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
    dateOfBirth: {
      type: String,
      required: true,
    },
    cv: {
      type: String,
      required: true,
      trim: true,
    },
    studentsIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
    ],
    avatar: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      required: true,
      enum: [male, female, Male, Female],
    },
    password: {
      type: String,
      default: "",
      trim: true,
    },
    token: {
      type: String,
      required: true,
    },
    totalSubscriptionPrices: {
      type: String,
    },
    role: {
      type: String, // ['TEACHER']
      enum: [TEACHER],
      default: TEACHER,
    },
    status: {
      type: String,
      default: pending,
      enum: [pending, accepted, refused],
      trim: true,
    },
    verificationCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
teacherSchema.index({ fullName: 1, dateOfBirth: 1 });
teacherSchema.plugin(mongoosePaginate);

const teacher = mongoose.model("Teacher", teacherSchema);

module.exports = teacher;
