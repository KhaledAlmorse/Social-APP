import { EventEmitter } from "events";
import jwt from "jsonwebtoken";

import { signup } from "./generateHtml.js";
import { sendEmail, subjects } from "./sendEmail.js";
export const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", async (email,otp,subject) => {
  //* logic send email
  // const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);
  // const link = `http://localhost:8000/auth/acctivate_account/${token}`;

  await sendEmail({
    to: email,
    subject,
    html: signup(otp),
  });
});

