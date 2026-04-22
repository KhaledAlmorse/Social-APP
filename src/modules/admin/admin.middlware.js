import { roles } from "../../DB/model/user.model.js";

export const canChangeRole = async (req, res, next) => {
  const allRoles = Object.values(roles);

  const userReq = req.user;
  const targetUser = await User.findById(req.body.userId);

  const userReqRole = userReq.role;
  const targetUserRole = targetUser.role;

  const userReqRoleIndex = allRoles.indexOf(userReqRole);
  const targetUserRoleIndex = allRoles.indexOf(targetUserRole);

  const canChange = userReqRoleIndex < targetUserRoleIndex;

  if (!canChange) {
    return next(
      new Error("You are not authorized to change this user's role", {
        cause: 403,
      }),
    );
  }

  return next();
};
