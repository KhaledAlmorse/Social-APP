import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  //* sender (transporter )

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });

    //* Reciver (message)
    const info = await transporter.sendMail({
      from: `"Social App" <${process.env.USER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(process.env.USER_EMAIL);

    return info.rejected.length == 0 ? true : false;
  } catch (error) {
    console.log(error);
  }
};
export const subjects = {
  register: "Acctivate Account",
  resetPassword: "Reset Password",
  verifyEmail: "Verify Email",
};
