const appError = require("./appError");
const { ERROR } = require("./httpStatusText");

module.exports = (code) => {
  if (code) {
    return `
    <div style="text-align: right;">
        <p>رمز التحقق الخاص بك هو ${code}</p>
    </div>
    `;
  }
  return appError.create("code not defind", 400, ERROR);
};
