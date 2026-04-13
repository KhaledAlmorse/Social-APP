import { Router } from "express";
import * as authSerivce from "./auth.service.js";
import validation from "../../middlware/validation.middlware.js";
import * as authSchemas from "../auth/auth.validation.js";

const router = Router();

//* Send OTp

router.post("/sendOTP",
  validation(authSchemas.sendOTP),
  authSerivce.sendOTP
);


//* register
router.post(
  "/register",
  validation(authSchemas.register),
  authSerivce.register
);
//* login
router.post("/login", validation(authSchemas.login), authSerivce.login);

//* acctivate account
// router.get("/acctivate_account/:token", authSerivce.acctivateAccount);

//* new access token
router.post("/newAccessToken", validation(authSchemas.newAccessToken), authSerivce.newAccessToken)

//* Verify OTP
router.post("/verifiy_otp", validation(authSchemas.verifyOTP), authSerivce.verifyOTP)


//* Forget password
router.post("/forget_pass", validation(authSchemas.forgetPassword), authSerivce.forgetPassword)


//* Reset password
router.post("/reset_pass", validation(authSchemas.resetPassword), authSerivce.resetPassword)


export default router;
