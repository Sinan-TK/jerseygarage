import nodemailer from "nodemailer";

async function sendOTP(email, otp, message) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_NODEMAILER,
      pass: process.env.APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_NODEMAILER,
    to: email,
    subject: "Your OTP Code",
    text: `${message}Your OTP is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
}

export default sendOTP;
