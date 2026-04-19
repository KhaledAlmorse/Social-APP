import { roles } from "../../DB/model/user.model.js";

const endPoints = {
  createPost: [roles.user],
  updatePost: [roles.user],
  getPosts: [roles.user],
  getPost: [roles.user],
  deletePost: [roles.user],
  freezePost: [roles.admin, roles.user],
  restorePost: [roles.admin, roles.user],
  likeUnlikePost: [roles.user],
};

export default endPoints;
