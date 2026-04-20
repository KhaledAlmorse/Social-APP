import { roles } from "../../DB/model/user.model.js";

const endPoints = {
  createComment: [roles.user],
  updateComment: [roles.user],
  deleteComment: [roles.user],
  softDelete: [roles.user, roles.admin],
  getComments: [roles.user, roles.admin],
  getComment: [roles.user, roles.admin],
  likeUnlikeComment: [roles.user, roles.admin],
  replyToComment: [roles.user],
};

export default endPoints;
