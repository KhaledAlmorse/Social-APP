import { Router } from "express";

import * as commentServices from "../comment/comment.service.js";
import * as commentValidation from "../comment/comment.validation.js";
import isAuthenticated from "../../middlware/authentication.middlware.js";
import isAuthorized from "../../middlware/authorization.middlware.js";
import endPoints from "../comment/comment.endpoint.js";
import validation from "../../middlware/validation.middlware.js";
import { uploadCloud } from "../../utils/fileUploading/multerCloud.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  isAuthenticated,
  isAuthorized(endPoints.createComment),
  uploadCloud().single("images"),
  validation(commentValidation.createComment),
  commentServices.createComment,
);

router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized(endPoints.updateComment),
  uploadCloud().single("images"),
  validation(commentValidation.updateComment),
  commentServices.updateComment,
);

//*Soft Delete
router.delete(
  "/:id/delete",
  isAuthenticated,
  isAuthorized(endPoints.deleteComment),
  validation(commentValidation.deleteComment),
  commentServices.deleteComment,
);
//*Soft Delete
router.patch(
  "/:id/softDelete",
  isAuthenticated,
  isAuthorized(endPoints.softDelete),
  validation(commentValidation.softDelete),
  commentServices.softDelete,
);

//* gel all comment  --> /post/:postId/comment
router.get(
  "/",
  isAuthenticated,
  isAuthorized(endPoints.getComments),
  validation(commentValidation.getComments),
  commentServices.getComments,
);

//* get comment
router.get(
  "/:id",
  isAuthenticated,
  isAuthorized(endPoints.getComment),
  validation(commentValidation.getComment),
  commentServices.getComment,
);

//* Like and unlike Comment
router.patch(
  "/:id/like-unlike",
  isAuthenticated,
  isAuthorized(endPoints.likeUnlikeComment),
  validation(commentValidation.likeUnlikeComment),
  commentServices.likeUnlikeComment,
);

//* reply on comment --> /post/:postId/comment/:id/reply
router.post(
  "/:id/reply",
  isAuthenticated,
  isAuthorized(endPoints.replyToComment),
  uploadCloud().single("images"),
  validation(commentValidation.replyToComment),
  commentServices.replyToComment,
);
export default router;
