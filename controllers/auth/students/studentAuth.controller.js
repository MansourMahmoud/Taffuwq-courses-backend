const asyncWrapper = require("../../../middleware/asyncWrapper");
const { SUCCESS, FAIL } = require("../../../utils/httpStatusText");
const appError = require("../../../utils/appError");
const Student = require("../../../models/student.model");
const storage = require("../../../helpers/firebase");
const {
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const { v4 } = require("uuid");
const { randomDigits } = require("../../../utils/randomDigits");
const sendMail = require("../../../emails/sendMail");
const handleResMailCode = require("../../../utils/handleResMailCode");
const statusEnum = require("../../../utils/status");
const validator = require("validator");
const Owner = require("../../../models/owner.model");
const AdminNotification = require("../../../models/adminNotification.model");

const studentRegistration = asyncWrapper(async (req, res, next) => {
  const {
    email,
    password,
    fullName,
    idNum,
    gender,
    branch,
    nameOfSchool,
    dateOfBirth,
    phone,
    age,
  } = req.body;
  const file = req.file;

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

  const oldStudent = await Student.findOne({ email: email });

  if (oldStudent) {
    const error = appError.create("The Email already exists", 400, FAIL);
    return next(error);
  }

  if (!fullName) {
    const err = appError.create("fullName is required", 400, FAIL);
    next(err);
  } else if (!branch) {
    const err = appError.create("branch is required", 400, FAIL);
    next(err);
  } else if (!nameOfSchool) {
    const err = appError.create("nameOfSchool is required", 400, FAIL);
    next(err);
  } else if (!age) {
    const err = appError.create("age is required", 400, FAIL);
    next(err);
  }

  const isIdNumNine = /^\d{9}$/.test(idNum.toString());

  if (!isIdNumNine) {
    const err = appError.create("idNum invalid", 400, FAIL);
    next(err);
  }

  const isIdNumInDB = await Student.findOne({ idNum });

  if (isIdNumInDB) {
    const err = appError.create("The idNum already exists", 400, FAIL);
    next(err);
  }

  if (!dateOfBirth) {
    const err = appError.create("dateOfBirth is required", 400, FAIL);
    next(err);
  } else if (!gender) {
    const err = appError.create("gender is required", 400, FAIL);
    next(err);
  }

  // create cv file on firebase
  let avatar = null;

  if (file) {
    const ex = file.mimetype.split("/").pop();
    let exName = file.originalname.split(`.${ex}`)[0];

    const avatarRef = ref(
      storage,
      `student-avatar/${exName + v4() + "." + ex}`
    );

    const metadata = {
      contentType: file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      avatarRef,
      file.buffer,
      metadata
    );

    const downloadURL = await getDownloadURL(snapshot.ref);

    avatar = downloadURL;
  }

  const code = randomDigits(6);

  const newStudent = new Student({
    age,
    email,
    phone,
    password,
    fullName,
    branch,
    nameOfSchool,
    idNum,
    dateOfBirth,
    avatar: avatar
      ? avatar
      : gender === "female" || gender === "Female"
      ? "https://firebasestorage.googleapis.com/v0/b/taffuwq-courses.appspot.com/o/female-avatar.png?alt=media&token=057c11f0-ed51-478d-b761-e80da296160f"
      : (gender === "male" || gender === "Male") &&
        "https://firebasestorage.googleapis.com/v0/b/taffuwq-courses.appspot.com/o/male-avatar.png?alt=media&token=258c8f6e-33dd-4190-b734-a1f31c999903",
    gender,
    verificationCode: code,
  });

  await newStudent.generateAuthToken();

  await newStudent.save();
  const text = handleResMailCode(code);

  sendMail(email, text);

  const owners = await Owner.find();

  const result = owners.map(async (owner) => {
    const newNotificationForAdmin = new AdminNotification({
      ownerId: "",
      content: ` طلب تسجيل جديد من ${newStudent.fullName} كطالب `,
    });

    newNotificationForAdmin.ownerId = owner._id;
    await newNotificationForAdmin.save();
  });

  return res.status(201).json({
    status: SUCCESS,
    message: "student saved successfully, please verify!",
    data: { student: newStudent },
  });
});

const verifyStudent = asyncWrapper(async (req, res, next) => {
  const { email, code } = req.body;
  const student = await Student.findOne({ email });

  if (!student) {
    const err = appError.create("student not found", 400, FAIL);
    next(err);
  }

  if (student?.verificationCode === code) {
    student.status = statusEnum.ACTIVE;
    student.verificationCode = "";
    await student.save();

    const owners = await Owner.find();

    const result = owners.map(async (owner) => {
      const newNotificationForAdmin = new AdminNotification({
        ownerId: "",
        content: ` قام الطالب ${student.fullName} بالتحقق من إيميله بنجاح `,
      });

      newNotificationForAdmin.ownerId = owner._id;
      await newNotificationForAdmin.save();
    });

    return res.status(200).json({
      status: SUCCESS,
      message: "student has been verified!",
    });
  }
  const err = appError.create("code invalid", 400, FAIL);
  next(err);
});

const studentLogin = asyncWrapper(async (req, res, next) => {
  const { idNum, password } = req.body;
  const student = await Student.findByCredentials(idNum, password);

  return res.status(200).json({
    status: SUCCESS,
    message: "student logged in!",
    data: { token: student.token },
  });
});

module.exports = {
  studentRegistration,
  studentLogin,
  verifyStudent,
};
