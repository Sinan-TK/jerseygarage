const nodemailer = require("nodemailer");

async function sendOTP(email, otp, message) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "jerseygarageofficial@gmail.com",
      pass: "ezriyacjwecbvddm",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  //   ezri yacj wecb vddm

  const mailOptions = {
    from: "jerseygarageofficial@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `${message}.Your OTP is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOTP;
