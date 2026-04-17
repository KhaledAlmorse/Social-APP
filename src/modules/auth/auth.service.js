import Randomstring from "randomstring";

//* Auth Services
import User from "../../DB/model/user.model.js";
import OTP from "../../DB/model/otp.model.js";
import { OAuth2Client } from "google-auth-library";

import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import { emailEmitter } from "../../utils/emails/email.event.js";
import { compareHash, hash } from "../../utils/hashing/hash.js";
import { generateToken, verifyToken } from "../../utils/token/token.js";
import { encrypt } from "../../utils/encryption/encryption.js";
import { subjects } from "../../utils/emails/sendEmail.js";

export const register = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const otp = Randomstring.generate({ length: 6, charset: "alphanumeric" });
  await OTP.create({ otp, email });

  //* Create Users
  const user = await User.create({
    ...req.body,

    //* encrypt phone
    phone: encrypt({ plainText: req.body.phone }),
  });

  //* Send Email Event
  emailEmitter.emit("sendEmail", req.body.email, otp, subjects.register);

  return res.status(201).json({ sucess: true, message: "Verify Your OTP.." });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //*check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error(`Invalid email`, { cause: 400 }));

  //* check account is active or not
  if (!user.isAcctivated)
    return next(
      new Error(`You must to acctivate your account first`, { cause: 500 }),
    );

  //*check password
  if (!compareHash({ plainText: password, hash: user.password }))
    return next(new Error(`Invalid password`, { cause: 400 }));

  user.isLoggedIn = true;
  user.freezed = false;
  await user.save();

  //* generate token
  // const token = generateToken({ payload: { id: user._id, email: user.email } });

  return res.status(200).json({
    sucess: true,
    message: "Succsess Login!",
    access_token: generateToken({
      payload: { id: user._id, email: user.email },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
    }),
    refresh_token: generateToken({
      payload: { email: user.email, id: user._id },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE },
    }),
  });
});

//* refresh token ,generate new Access Token
export const newAccessToken = asyncHandler(async (req, res, next) => {
  const { refresh_token } = req.body;

  const payload = verifyToken({ token: refresh_token });

  const user = await User.findById(payload.id);

  if (!user) return next(new Error("User Not Found", { cause: 400 }));

  const access_token = generateToken({
    payload: { id: user._id, email: user.email },
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
  });

  return res
    .status(200)
    .json({ success: true, result: { access_token: access_token } });
});
// export const acctivateAccount = asyncHandler(async (req, res, next) => {
//   const { token } = req.params;
//   const { email } = verifyToken({ token });

//   const user = await User.findOne({ email });
//   if (!user) {
//     return next(new Error(`Doucument Not found`, { cause: 400 }));
//   }

//   user.isAcctivated = true;
//   await user.save();
//   return res.status(200).json({ sucess: true, message: "try to login" });
// });

export const sendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return next(new Error("User already exists.", { cause: 409 }));
  }

  const otp = Randomstring.generate({
    length: 6,
    charset: "alphanumeric",
  });

  await OTP.deleteMany({ email });

  const savedOTP = await OTP.create({ email, otp });

  emailEmitter.emit("sendEmail", email, otp, subjects.register);

  return res.json({
    success: true,
    message: "OTP sent successfully.",
    data: {
      email: savedOTP.email,
      otp: savedOTP.otp,
      createdAt: savedOTP.createdAt,
    },
  });
});

export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;

  const otpExist = await OTP.findOne({ otp });

  if (!otpExist) {
    return next(new Error("Ivalid OTP..", { cause: 400 }));
  }

  const user = await User.findOne({ email: otpExist.email });
  if (!user) return next(new Error("User Not Found", { cause: 400 }));

  user.isAcctivated = true;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "OTP Verified Successfully , Try To login..",
  });
});

//* forget Password

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({
    email,
    isAcctivated: true,
    freezed: false,
  });
  if (!user) return next(new Error("User Not Found", { cause: 400 }));

  const otp = Randomstring.generate({ length: 6, charset: "alphanumeric" });

  await OTP.deleteMany({ email });

  await OTP.create({ email, otp });

  emailEmitter.emit("sendEmail", email, otp, subjects.resetPassword);

  return res
    .status(200)
    .json({ success: true, message: "OTP Send Succsessfully.." });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({
    email,
    isAcctivated: true,
    freezed: false,
  });
  if (!user) return next(new Error("User Not Found", { cause: 400 }));

  const otpExist = await OTP.findOne({ otp, email });
  if (!otpExist) return next(new Error("OTP Not Exist..", { cause: 400 }));

  user.password = password;
  await user.save();
  await OTP.deleteMany({ email });

  return res.status(200).json({
    success: true,
    message: "Try to login again!",
  });
});

//* Login with Google
export const loginWithGoogle = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  async function verify() {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  const userData = await verify();
  const { email, email_verified, name, picture } = userData;
  if (!email_verified) return next(new Error("Email is invalid.."));

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new Error("User already exists.."));

  const user = await User.create({
    email,
    userName: name,
    provider: providers.google,
    isAcctivated: true,
  });
  const access_token = generateToken({
    payload: { id: user._id, email: user.email },
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
  });

  refresh_token = generateToken({
    payload: { email: user.email, id: user._id },
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE },
  });

  return res.status(200).json({
    success: true,
    message: "Login Successfully..",
    result: { access_token, refresh_token },
  });
});
