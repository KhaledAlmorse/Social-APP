import Joi from "joi";

export const updateProfile = Joi.object({
  userName: Joi.string()
    .min(5)
    .max(15)
    .messages({ "string.base": "userName must be string" }),
  email: Joi.string().email(),
  phone: Joi.string(),
  gender: Joi.string(),
}).required();

export const updatePassword = Joi.object({
  oldPassword: Joi.string().required(),

  newPassword: Joi.string()
    .not(Joi.ref("oldPassword"))
    .messages({
      //* type : customMessage
      "any.invalid": "new password must not be the same as old password",
    })
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
}).required();

export const deactivateAccount = Joi.object({
  password: Joi.string().required(),
}).required();
