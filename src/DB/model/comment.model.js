import mongoose, { Types } from "mongoose";
import cloudinary from "../../utils/fileUploading/cloudinary.config.js";

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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

commentSchema.post(
  "deleteOne",
  { query: false, document: true },
  async function (doc, next) {
    //* Delete image form clouinary if exist
    if (doc.image.secure_url) {
      await cloudinary.uploader.destroy(doc.image.public_id);
    }

    const parentComment = doc._id;
    const replies = await this.constructor.find({ parentComment });

    if (replies.length > 0) {
      for (const reply of replies) {
        await reply.deleteOne();
      }
    }
    return next();
  },
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
