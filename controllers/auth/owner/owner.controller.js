const asyncWrapper = require("../../../middleware/asyncWrapper");
const { SUCCESS, FAIL } = require("../../../utils/httpStatusText");
const appError = require("../../../utils/appError");
const Owner = require("../../../models/owner.model");
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
const ownerRegistration = asyncWrapper(async (req, res, next) => {
  const { email, password, fullName, idNum, gender } = req.body;
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

  const oldOwner = await Owner.findOne({ email: email });

  if (oldOwner) {
    const error = appError.create("owner already exists", 400, FAIL);
    return next(error);
  }

  if (!fullName) {
    const err = appError.create("fullName is required", 400, FAIL);
    next(err);
  } else if (!idNum) {
    const err = appError.create("idNum is required", 400, FAIL);
    next(err);
  } else if (!gender) {
    const err = appError.create("gender is required", 400, FAIL);
    next(err);
  }

  // create cv file on firebase
  let ownerAvatar = null;

  if (file) {
    const ex = file.mimetype.split("/").pop();
    let exName = file.originalname.split(`.${ex}`)[0];

    const ownerAvatarRef = ref(
      storage,
      `owner-avatar/${exName + v4() + "." + ex}`
    );

    const metadata = {
      contentType: file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      ownerAvatarRef,
      file.buffer,
      metadata
    );

    const downloadURL = await getDownloadURL(snapshot.ref);

    ownerAvatar = downloadURL;
  }

  const code = randomDigits(6);

  const newOwner = new Owner({
    email,
    password,
    fullName,
    idNum,
    ownerAvatar: ownerAvatar
      ? ownerAvatar
      : gender === "female" || gender === "Female"
      ? "https://firebasestorage.googleapis.com/v0/b/taffuwq-courses.appspot.com/o/female-avatar.png?alt=media&token=057c11f0-ed51-478d-b761-e80da296160f"
      : (gender === "male" || gender === "Male") &&
        "https://firebasestorage.googleapis.com/v0/b/taffuwq-courses.appspot.com/o/male-avatar.png?alt=media&token=258c8f6e-33dd-4190-b734-a1f31c999903",
    gender,
    verificationCode: code,
  });

  await newOwner.generateAuthToken();

  await newOwner.save();
  const text = handleResMailCode(code);

  sendMail(email, text);

  return res.status(201).json({
    status: SUCCESS,
    message: "owner saved successfully, please verify!",
    data: { owner: newOwner },
  });
});

const verifyOwner = asyncWrapper(async (req, res, next) => {
  const { email, code } = req.body;
  const owner = await Owner.findOne({ email });

  if (!owner) {
    const err = appError.create("owner not found", 400, FAIL);
    next(err);
  }

  if (owner?.verificationCode === code) {
    owner.status = statusEnum.ACTIVE;
    owner.verificationCode = "";
    await owner.save();

    return res.status(200).json({
      status: SUCCESS,
      message: "owner has been verified!",
    });
  }

  const err = appError.create("code invalid", 400, FAIL);
  next(err);
});

const ownerLogin = asyncWrapper(async (req, res, next) => {
  const { idNum, password } = req.body;
  const owner = await Owner.findByCredentials(idNum, password);

  return res.status(200).json({
    status: SUCCESS,
    message: "owner logged in!",
    data: { token: owner.token },
  });
});

module.exports = {
  ownerRegistration,
  ownerLogin,
  verifyOwner,
};
