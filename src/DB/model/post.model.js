import mongoose, { Types } from "mongoose";

const postSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      minlength: 2,
      required: function () {
        return this.images.length ? false : true;
      },
    },
    images: [{ secure_url: String, public_id: String }],
    user: { type: Types.ObjectId, ref: "User", required: true },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    cloudFolder: {
      type: String,
      unique: true,
      required: function () {
        return this.images.length ? true : false;
      },
    },
  },
  { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);

export default Post;
