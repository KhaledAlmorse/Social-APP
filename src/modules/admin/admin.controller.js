import { Router } from "express";

import * as adminServices from "./admin.service.js";
import * as adminValidation from "./admin.validtion.js";
import isAuthenticated from "../../middlware/authentication.middlware.js";
import isAuthorized from "../../middlware/authorization.middlware.js";
import endPoints from "./admin.endpoint.js";
import validation from "../../middlware/validation.middlware.js";

const router = Router();

//* 1- gel all users and posts

router.get(
  "/",
  isAuthenticated,
  isAuthorized(endPoints.getAllUsersAndPosts),
  //   validation(adminValidation.getAllUsersAndPosts),
  adminServices.getAllUsersAndPosts,
);

//* 2- change role
router.patch(
  "/role",
  isAuthenticated,
  isAuthorized(endPoints.changeRole),
  validation(adminValidation.changeRole),
  adminServices.changeRole,
);

export default router;
