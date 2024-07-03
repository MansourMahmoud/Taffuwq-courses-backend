const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "taffuwq@gmail.com",
    pass: "uldwzqjbgbkogekp",
  },
});

const mailOptions = {
  from: {
    name: "Taffuwq Courses",
    address: "palestine,Nablus",
  },
  subject: "Status of Teacher",
  text: "Hello world?",
  html: "<b>Hello world?</b>",
};

const sendMail = async (email, text) => {
  mailOptions.to = email;
  mailOptions.html = text;
  try {
    await transporter.sendMail(mailOptions);
    return "email sent successfully";
  } catch (error) {
    console.log(error);
    return "email not sent";
  }
};

module.exports = sendMail;
