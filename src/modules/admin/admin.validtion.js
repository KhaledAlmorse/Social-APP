import joi from "joi";
import { isValidObjectId } from "../../middlware/validation.middlware.js";

export const getAllUsersAndPosts = joi.object({}).required();

export const changeRole = joi
  .object({
    userId: joi.custom(isValidObjectId).required(),
    newRole: joi.string().valid("user", "admin").required(),
  })
  .required();
