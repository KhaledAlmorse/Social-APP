import { roles } from "../../DB/model/user.model.js";

const endPoints = {
  profile: [roles.admin, roles.user],
  updateProfile: [roles.user],
  updatePassword: [roles.user],
  deactivateAccount: [roles.user],
};

export default endPoints;
