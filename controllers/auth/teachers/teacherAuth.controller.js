const asyncWrapper = require("../../../middleware/asyncWrapper");
const Teacher = require("../../../models/teacher.model");
const appError = require("../../../utils/appError");
const bcryptjs = require("bcryptjs");
const { SUCCESS, FAIL } = require("../../../utils/httpStatusText");
const generateJWT = require("../../../utils/generateJWT");
const { randomDigits } = require("../../../utils/randomDigits");
const sendMail = require("../../../emails/sendMail");
const validator = require("validator");
const storage = require("../../../helpers/firebase");
const {
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const { v4 } = require("uuid");
const bcrypt = require("bcryptjs");

const teacherRegistration = asyncWrapper(async (req, res, next) => {
  const { email, phone, fullName, idNum, course, branch, dateOfBirth, gender } =
    req.body;
  const files = req?.files;
  console.log(files);
  if (!email) {
    const err = appError.create("email is required", 400, FAIL);
    next(err);
  } else if (!validator.isEmail(email)) {
    const err = appError.create(
      "email must be a provided and an actual email",
      400,
      FAIL
    );
    next(err);
  }

  const oldTeacher = await Teacher.findOne({ email: email });

  if (oldTeacher) {
    const error = appError.create("Teacher already exists", 400, FAIL);
    return next(error);
  }

  if (!phone) {
    const err = appError.create("phone is required", 400, FAIL);
    next(err);
  } else if (!fullName) {
    const err = appError.create("fullName is required", 400, FAIL);
    next(err);
  }
  const isIdNumNine = /^\d{9}$/.test(idNum.toString());

  if (!isIdNumNine) {
    const err = appError.create("idNum invalid", 400, FAIL);
    next(err);
  }

  const isIdNumInDB = await Teacher.findOne({ idNum });

  if (isIdNumInDB) {
    const err = appError.create("The idNum already exists", 400, FAIL);
    next(err);
  }

  if (!course) {
    const err = appError.create("course is required", 400, FAIL);
    next(err);
  } else if (!branch) {
    const err = appError.create("branch is required", 400, FAIL);
    next(err);
  } else if (!dateOfBirth) {
    const err = appError.create("dateOfBirth is required", 400, FAIL);
    next(err);
  } else if (!gender) {
    const err = appError.create("dateOfBirth is required", 400, FAIL);
    next(err);
  }

  // create cv file on firebase
  let cv = null;

  if (files.cv) {
    const file = files.cv[0];
    const ex = file.mimetype.split("/").pop();
    let exName = file.originalname.split(`.${ex}`)[0];

    const teacherCVRef = ref(storage, `CVs/${exName + v4() + "." + ex}`);

    const metadata = {
      contentType: file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      teacherCVRef,
      file.buffer,
      metadata
    );

    const downloadURL = await getDownloadURL(snapshot.ref);

    cv = downloadURL;
  }

  let teacherAvatar = null;

  if (files.teacherAvatar) {
    const file = files.teacherAvatar[0];
    const ex = file.mimetype.split("/").pop();
    let exName = file.originalname.split(`.${ex}`)[0];

    const teacherAvatarRef = ref(
      storage,
      `teacher-avatar/${exName + v4() + "." + ex}`
    );

    const metadata = {
      contentType: file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      teacherAvatarRef,
      file.buffer,
      metadata
    );

    const downloadURL = await getDownloadURL(snapshot.ref);

    teacherAvatar = downloadURL;
  }

  if (!files.cv[0] || !files.teacherAvatar[0]) {
    const err = appError.create("files is required", 400, FAIL);
    next(err);
  }

  const newTeacher = new Teacher({
    email,
    phone,
    fullName,
    idNum,
    course,
    branch,
    dateOfBirth,
    cv,
    teacherAvatar: teacherAvatar
      ? teacherAvatar
      : gender === "female" || gender === "Female"
      ? "https://firebasestorage.googleapis.com/v0/b/taffuwq-courses.appspot.com/o/female-avatar.png?alt=media&token=057c11f0-ed51-478d-b761-e80da296160f"
      : (gender === "male" || gender === "Male") &&
        "https://firebasestorage.googleapis.com/v0/b/taffuwq-courses.appspot.com/o/male-avatar.png?alt=media&token=258c8f6e-33dd-4190-b734-a1f31c999903",
    verificationCode: "",
    gender,
  });

  // generate JWT token
  const token = await generateJWT({
    email: newTeacher.email,
    id: newTeacher._id,
    role: newTeacher.role,
  });

  newTeacher.token = token;

  await newTeacher.save();

  const teacherObject = newTeacher.toObject();

  delete teacherObject.token;
  delete teacherObject.password;
  delete teacherObject.verificationCode;
  delete teacherObject.__v;

  return res.status(201).json({
    status: SUCCESS,
    message: "Teacher has been registered and is pending approval now.",
    data: { teacher: teacherObject },
  });
});

const teacherLogin = asyncWrapper(async (req, res, next) => {
  const { idNum, password } = req.body;
  console.log({ idNum, password });

  if (!idNum) {
    const err = appError.create("idNum is required", 400, FAIL);
    next(err);
  } else if (!password) {
    const err = appError.create("password is required", 400, FAIL);
    next(err);
  }

  const teacher = await Teacher.findOne({ idNum });

  if (!teacher) {
    const err = appError.create("idNum or password is invalid", 400, FAIL);
    next(err);
  }

  if (teacher.status === "pending") {
    const err = appError.create(
      "can not login, the teacher is still pending",
      400,
      FAIL
    );
    next(err);
  }

  const isMatch = await bcrypt.compare(password, teacher.password);
  if (!isMatch) {
    const err = appError.create("idNum or password is invalid", 400, FAIL);
    next(err);
  }

  return res.status(200).json({
    status: SUCCESS,
    message: "teacher logged in successfully",
    data: { token: teacher.token },
  });
});

module.exports = {
  teacherRegistration,
  teacherLogin,
};
