import mongoose, { Types } from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: function () {
        this.image ? false : true;
      },
    },
    image: { secure_url: String, public_id: String },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: String, default: false },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    parentComment: { type: Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true },
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
