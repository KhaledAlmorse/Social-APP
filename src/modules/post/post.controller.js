import { Router } from "express";

import * as postServices from "../post/post.service.js";
import * as postSchemas from "./post.validation.js";

import isAuthenticated from "../../middlware/authentication.middlware.js";
import isAuthorized from "../../middlware/authorization.middlware.js";
import endPoints from "./post.endpoint.js";
import { uploadCloud } from "../../utils/fileUploading/multerCloud.js";
import validation from "../../middlware/validation.middlware.js";

const router = Router();

router.post(
  "/createPost",
  isAuthenticated,
  isAuthorized(endPoints.createPost),
  uploadCloud().array("images"),
  validation(postSchemas.createPost),
  postServices.createPost,
);
router.patch(
  "/updatedPost/:id",
  isAuthenticated,
  isAuthorized(endPoints.updatePost),
  uploadCloud().array("images"),
  validation(postSchemas.updatePost),
  postServices.updatePost,
);
//* get all un deleted posts
router.get(
  "/",
  isAuthenticated,
  isAuthorized(endPoints.getPosts),
  postServices.getAllActivePosts,
);

//* get all deleted posts

router.get(
  "/deleted",
  isAuthenticated,
  isAuthorized(endPoints.getPosts),
  postServices.getAllDeletedPosts,
);

router.get(
  "/:id",
  isAuthenticated,
  isAuthorized(endPoints.getPost),
  validation(postSchemas.getPost),
  postServices.getPost,
);
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized(endPoints.deletePost),
  validation(postSchemas.deletePost),
  postServices.deletePost,
);

//* freeze post
router.patch(
  "/:id/freeze",
  isAuthenticated,
  isAuthorized(endPoints.freezePost),
  validation(postSchemas.freezePost),
  postServices.freezePost,
);

//* restore post
router.patch(
  "/:id/restore",
  isAuthenticated,
  isAuthorized(endPoints.restorePost),
  validation(postSchemas.restorePost),
  postServices.restorePost,
);

//* Like and unlike post

router.patch(
  "/:id/like-unlike",
  isAuthenticated,
  isAuthorized(endPoints.likeUnlikePost),
  validation(postSchemas.likeUnlikePost),
  postServices.likeUnlikePost,
);

export default router;
