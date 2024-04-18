const jwt = require("jsonwebtoken");

module.exports = async (payload) => {
  // generate JWT token
  console.log(process.env.JWT_SECRET_KEY);
  const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY);
  return token;
};
