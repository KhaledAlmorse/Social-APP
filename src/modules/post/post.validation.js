import joi from "joi";
import {
  fileObj,
  isValidObjectId,
} from "../../middlware/validation.middlware.js";

export const createPost = joi
  .object({
    text: joi.string().min(2),
    file: joi.array().items(joi.object(fileObj)),
    // user: joi.string().required(),
  })
  .or("text", "file");

export const updatePost = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
    text: joi.string().min(2),
    file: joi.array().items(joi.object(fileObj)),
  })
  .or("text", "file");

export const getPost = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
  })
  .required();

export const deletePost = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
  })
  .required();

export const freezePost = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
  })
  .required();

export const restorePost = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
  })
  .required();

export const likeUnlikePost = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
  })
  .required();
