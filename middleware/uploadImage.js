const appError = require("../utils/appError");
const { FAIL } = require("../utils/httpStatusText");
const multer = require("multer");

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  console.log(file);

  if (imageType === "image") {
    cb(null, true);
  } else {
    const error = appError.create("file must be an image", 400, FAIL);
    cb(error, false);
  }
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter });

module.exports = upload;
