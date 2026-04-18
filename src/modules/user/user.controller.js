import { Router } from "express";
import isAuthenticated from "../../middlware/authentication.middlware.js";
import * as userService from "./user.service.js";
import isAuthorized from "../../middlware/authorization.middlware.js";
import endPoints from "./user.endpoint.js";
import validation from "../../middlware/validation.middlware.js";
import * as userSchemas from "./user.validation.js";
import {
  fileValidation,
  upload,
} from "../../utils/fileUploading/multerUpload.js";
import { uploadCloud } from "../../utils/fileUploading/multerCloud.js";

const router = Router();

//* get user Profile
router.get(
  "/profile",
  isAuthenticated,
  isAuthorized(endPoints.profile),
  userService.Profile,
);

//* update profile

router.patch(
  "/profile",
  isAuthenticated,
  isAuthorized(endPoints.updateProfile),
  validation(userSchemas.updateProfile),
  userService.updateProfile,
);

//* update password
router.patch(
  "/password",
  isAuthenticated,
  isAuthorized(endPoints.updatePassword),
  validation(userSchemas.updatePassword),
  userService.updatePassword,
);

//* deactivate account(soft delete)
router.delete(
  "/account",
  isAuthenticated,
  isAuthorized(endPoints.deactivateAccount),
  validation(userSchemas.deactivateAccount),
  userService.deactivateAccount,
);

//* update Email
router.patch(
  "/update_email",
  isAuthenticated,
  isAuthorized(endPoints.updateEmail),
  validation(userSchemas.updateEmail),
  userService.updateEmail,
);

//*  Email verification
router.get(
  "/verify_email/:token",
  // isAuthenticated,
  // isAuthorized(endPoints.verify_Email),
  // validation(userSchemas.verify_Email),
  userService.verify_Email,
);

//* Upload Image
router.post(
  "/profilePicture",
  isAuthenticated,
  upload(fileValidation.images, "Uploads/Users").single("image"), // retrun middlware ,parsing, req.file
  userService.profilePicture,
);

//* Upload Images
router.post(
  "/coverPics",
  isAuthenticated,
  upload().array("images"), // retrun middlware ,parsing, req.files
  userService.coverPictures,
);

//* delete Image
router.delete("/deletePic", isAuthenticated, userService.deleteProfilePicture);

//* Upload Image in Cloudinary
router.post(
  "/profilePictureCloud",
  isAuthenticated,
  uploadCloud().single("image"), // retrun middlware ,parsing, req.file
  userService.profilePictureCloud,
);

// Delete from Cloudinary
router.delete(
  "/deletePicCloud",
  isAuthenticated,
  userService.deleteProfilePicCloud,
);

export default router;
