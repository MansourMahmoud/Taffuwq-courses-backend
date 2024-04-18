const appError = require("../utils/appError");
const { FAIL } = require("../utils/httpStatusText");
const multer = require("multer");

const fileFilter = (req, file, cb) => {
  // التحقق من اسم الحقل (fieldname) ونوع الملف
  if (file.fieldname === "cv") {
    // التحقق من نوع الملف (PDF)
    const fileType = file.mimetype.split("/")[1];
    if (fileType === "pdf") {
      cb(null, true); // الملف صالح
    } else {
      cb(new Error("CV file must be a PDF")); // الملف غير صالح
    }
  } else if (file.fieldname === "teacherAvatar") {
    // التحقق من نوع الملف (Image)
    const mimeType = file.mimetype.split("/")[0];
    if (mimeType === "image") {
      cb(null, true); // الملف صالح
    } else {
      cb(new Error("Avatar file must be an image")); // الملف غير صالح
    }
  } else {
    // في حالة وجود اسم حقل غير متوقع
    cb(new Error("Unexpected field name"));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
});

module.exports = upload;
