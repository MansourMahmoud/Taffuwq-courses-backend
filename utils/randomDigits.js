const randomDigits = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10); // توليد رقم عشوائي بين 0 و 9
  }
  return result;
};

module.exports = { randomDigits };
