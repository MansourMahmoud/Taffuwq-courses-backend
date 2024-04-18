const { pending, accepted, refused } = require("./statusEnum‎");
const appError = require("./appError");
const { ERROR } = require("./httpStatusText");

module.exports = (status, course, branch, token) => {
  if (status === accepted) {
    return `
    <div style="text-align: right;">
        <p>السلام عليكم، لقد تم قبولكم في أكادمية تفوّق كأستاذ للفرع ${branch} لدورة ${course}.</p>
        <p>الرجاء إكمال عملية التسجيل حتى تتمكن من الدخول إلى الموقع.</p>
        <p>لإكمال عملية التسجيل وضبط كلمة السر الخاصة بكم الرجاء الضغط <a href="${process.env.BASE_URL_FRONTEND}/teachers/set-password-teacher/t=${token}" target="_blank">هنا</a>.</p>
    </div>
    `;
  } else if (status === refused) {
    return `
    <div style="text-align: right;">
        <p>السلام عليكم، لقد تم رفض طلبك للانضمام إلى أكاديمية تفوّق لأنك لا تستوفي المتطلبات، وشكراً لتفهمك ونتمنى لك حياة مهنية طيبة.</p>
    </div>
    `;
  }
  return appError.create("error", 400, ERROR);
};
