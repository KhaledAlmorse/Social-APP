import { Router } from "express";
import isAuthenticated from "../../middlware/authentication.middlware.js";
import * as userService from "./user.service.js";
import isAuthorized from "../../middlware/authorization.middlware.js";
import endPoints from "./user.endpoint.js";
import validation from "../../middlware/validation.middlware.js";
import * as userSchemas from "./user.validation.js";

const router = Router();

//* get user Profile
router.get(
  "/profile",
  isAuthenticated,
  isAuthorized(endPoints.profile),
  userService.Profile
);

//* update profile

router.patch(
  "/profile",
  isAuthenticated,
  isAuthorized(endPoints.updateProfile),
  validation(userSchemas.updateProfile),
  userService.updateProfile
);

//* update password
router.patch(
  "/password",
  isAuthenticated,
  isAuthorized(endPoints.updatePassword),
  validation(userSchemas.updatePassword),
  userService.updatePassword
);

//* deactivate account(soft delete)
router.delete(
  "/account",
  isAuthenticated,
  isAuthorized(endPoints.deactivateAccount),
  validation(userSchemas.deactivateAccount),
  userService.deactivateAccount
);

export default router;
