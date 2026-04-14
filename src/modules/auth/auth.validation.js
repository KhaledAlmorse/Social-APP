import Joi from "joi";
import { Schema } from "mongoose";

//* validate, schema
export const register = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  userName: Joi.string().min(5).max(15).required(),
  phone: Joi.string().required(),

}).required();

export const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();


export const sendOTP = Joi.object({
  email: Joi.string().email().required(),
  // otp:Joi.string().required()
}).required()


export const forgetPassword = Joi.object({
email:Joi.string().email().required()
}).required()


export const resetPassword = Joi.object({
  email:Joi.string().email().required(),
  otp:Joi.string().length(6).required(),
  password:Joi.string().required(),
  confirmPassword:Joi.string().valid(Joi.ref("password"))
}).required()


export const verifyOTP =Joi.object({
  otp:Joi.string().length(6).required(),
}).required()

export const newAccessToken =Joi.object({
  refresh_token:Joi.string().required(),
}).required()


export const loginWithGoogle =Joi.object({
  idToken:Joi.string().required(),
}).required()
