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

  const otpMailTemplate = (otp, purpose = "verification") => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f4f5f7; padding: 20px;">

    <!-- Header -->
    <div style="background: #0d0d0d; padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 26px; letter-spacing: 3px;">JERSEYGARAGE</h1>
      <p style="color: #9ca3af; margin: 6px 0 0; font-size: 12px; letter-spacing: 1px;">THE JERSEY STORE</p>
    </div>

    <!-- Body -->
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">

      <!-- Icon -->
      <div style="width: 60px; height: 60px; background: #f4f5f7; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🔐</span>
      </div>

      <h2 style="color: #0d0d0d; margin: 0 0 10px; font-size: 22px;">One-Time Password</h2>

      <!-- Purpose Message -->
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 6px;">
        You requested an OTP for <strong style="color: #0d0d0d;">${purpose}</strong>.
      </p>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 30px;">
        This OTP is valid for <strong style="color: #0d0d0d;">2 minutes</strong>. Do not share it with anyone.
      </p>

      <!-- OTP Box -->
      <div style="background: #0d0d0d; border-radius: 10px; padding: 24px 20px; margin: 0 auto 30px; max-width: 260px;">
        <p style="margin: 0 0 8px; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Your OTP</p>
        <p style="margin: 0; font-size: 38px; font-weight: bold; color: #ffffff; letter-spacing: 10px;">${otp}</p>
      </div>

      <!-- Warning -->
      <div style="background: #f9fafb; border-left: 3px solid #0d0d0d; padding: 12px 16px; text-align: left; border-radius: 4px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          ⚠️ <strong style="color: #0d0d0d;">Never share this OTP</strong> with anyone, including JerseyGarage support. We will never ask for your OTP.
        </p>
      </div>

      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        If you didn't request this, you can safely ignore this email.
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 20px;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0 0 6px;">
        © 2026 JerseyGarage. All rights reserved.
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        support@jerseygarage.com
      </p>
    </div>

  </div>
`;

  const mailOptions = {
    from: `"JerseyGarage" <${process.env.EMAIL_NODEMAILER}>`,
    to: email,
    subject: "Your OTP - JerseyGarage",
    html: otpMailTemplate(otp, message),
  };

  await transporter.sendMail(mailOptions);
}

export default sendOTP;
