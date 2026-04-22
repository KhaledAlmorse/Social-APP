import { roles } from "../../DB/model/user.model.js";

const endPoints = {
  getAllUsersAndPosts: [roles.admin, roles.superAdmin],
  changeRole: [roles.admin, roles.superAdmin],
};

export default endPoints;
