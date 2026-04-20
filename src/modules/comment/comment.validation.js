import joi from "joi";
import {
  fileObj,
  isValidObjectId,
} from "../../middlware/validation.middlware.js";

export const createComment = joi
  .object({
    postId: joi.custom(isValidObjectId).required(),
    text: joi.string().required(),
    file: joi.object(fileObj),
  })
  .or("text", "file");

export const updateComment = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
    text: joi.string().required(),
    file: joi.object(fileObj),
  })
  .or("text", "file");

export const deleteComment = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
  })
  .required();

export const softDelete = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
  })
  .required();

export const getComments = joi
  .object({
    postId: joi.custom(isValidObjectId).required(),
  })
  .required();

export const getComment = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
  })
  .required();

export const likeUnlikeComment = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
  })
  .required();

export const replyToComment = joi
  .object({
    id: joi.custom(isValidObjectId).required(),
    postId: joi.custom(isValidObjectId).required(),
    text: joi.string().required(),
    file: joi.object(fileObj),
  })
  .or("text", "file");
