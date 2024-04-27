const appError = require("../utils/appError");
const { FAIL } = require("../utils/httpStatusText");
const multer = require("multer");

const fileFilter = (req, file, cb) => {
  // التحقق من اسم الحقل (fieldname) ونوع الملف
  if (file.fieldname === "lectureVideo") {
    // التحقق من نوع الملف (PDF)
    const fileType = file.mimetype.split("/")[0];
    if (fileType === "video") {
      cb(null, true); // الملف صالح
    } else {
      cb(new Error("videoLecture file must be a video")); // الملف غير صالح
    }
  } else if (file.fieldname === "lectureAttachments") {
    // التحقق من نوع الملف (Image)
    const mimeType = file.mimetype.split("/")[1];
    if (mimeType === "pdf") {
      cb(null, true); // الملف صالح
    } else {
      cb(new Error("lectureAttachments file must be a pdf")); // الملف غير صالح
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
