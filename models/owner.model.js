const mongoose = require("mongoose");
const validator = require("validator");
const { OWNER } = require("../utils/userRols");
const { male, female, Male, Female } = require("../utils/genderEnum");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { FAIL } = require("../utils/httpStatusText");
const appError = require("../utils/appError");
const statusEnum = require("../utils/status");

const ownerSchema = mongoose.Schema(
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
      type: String, // ['OWNER']
      enum: [OWNER],
      default: OWNER,
    },
    gender: {
      type: String,
      required: true,
      enum: [male, female, Male, Female],
    },
    ownerAvatar: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: statusEnum,
      default: statusEnum.INACTIVE,
    },
    verificationCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ownerSchema.statics.findByCredentials = async (idNum, password) => {
  const owner = await Owner.findOne({ idNum });

  if (!owner) {
    throw appError.create("idNum or password is invalid", 400, FAIL);
  }

  const isMatch = await bcrypt.compare(password, owner.password);

  if (!isMatch) {
    throw appError.create("idNum or password is invalid", 400, FAIL);
  }

  return owner;
};

// تحديث قيمة ownerAvatar استنادًا إلى قيمة الجنس
ownerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

ownerSchema.methods.generateAuthToken = async function () {
  const owner = this;
  const token = jwt.sign(
    { id: owner._id.toString(), email: owner.email },
    process.env.JWT_SECRET_KEY
  );
  owner.token = token;
  await owner.save();
  return token;
};

ownerSchema.methods.toJSON = function () {
  const owner = this;
  const ownerObject = owner.toObject();

  delete ownerObject.password;
  delete ownerObject.token;

  return ownerObject;
};

ownerSchema.index({ fullName: 1 });

const Owner = mongoose.model("Owner", ownerSchema);

module.exports = Owner;
