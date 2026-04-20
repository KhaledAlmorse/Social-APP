import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import Comment from "../../DB//model/comment.model.js";
import cloudinary from "../../utils/fileUploading/cloudinary.config.js";
import User, { roles } from "../../DB/model/user.model.js";
import Post from "../../DB/model/post.model.js";
import { nanoid } from "nanoid";

//* Create Comment
export const createComment = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  const { postId } = req.params;
  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) return next(new Error("invalid id post", { cause: 404 }));

  const userPost = await User.findById(post.user);
  let image;
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/users/${userPost.userName}_${post.user}/posts/${post.cloudFolder}/comments`,
      },
    );
    image = { secure_url, public_id };
  }

  console.log(post);

  const comment = await Comment.create({
    text,
    image,
    post: postId,
    user: req.user._id,
  });

  return res.status(200).json({ success: true, comment });
});

//* Update Comment
export const updateComment = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  const { id } = req.params;

  const comment = await Comment.findOne({ _id: id, isDeleted: false });
  if (!comment) return next(new Error("Comment not found", { cause: 404 }));

  const post = await Post.findOne({ _id: comment.post, isDeleted: false });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const userPost = await User.findById(post.user);

  if (comment.user.toString() != req.user._id.toString()) {
    return next(
      new Error("You not authorized to updated this comment", { cause: 404 }),
    );
  }

  let newImage = {};
  if (req.file) {
    //* Logic for updating the image
    //* 1. Upload new image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/users/${userPost.userName}_${post.user}/posts/${post.cloudFolder}/comments`,
      },
    );

    //* 2. Delete old image if it exists
    if (comment.image && comment.image.public_id) {
      await cloudinary.uploader.destroy(comment.image.public_id);
    }

    //* 3. Update the comment object with new image data
    newImage = { secure_url, public_id };
  }

  //* Update text if provided
  if (text) {
    comment.text = text;
  }
  comment.image = newImage;
  await comment.save();

  return res.status(200).json({ success: true, comment });
});

export const deleteComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findOne({ _id: id, isDeleted: false });
  if (!comment) return next(new Error("Comment not found", { cause: 404 }));

  const post = await Post.findOne({ _id: comment.post, isDeleted: false });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const commentOwner = comment.user.toString() == req.user._id.toString();

  const postOwner = post.user.toString() == req.user._id.toString();

  const admin = req.user.role == roles.admin;

  if (!commentOwner && !postOwner && !admin)
    return next(
      new Error("you not authorized to delete this post", { cause: 404 }),
    );

  await Comment.findByIdAndDelete(id);
  return res
    .status(200)
    .json({ success: true, message: "comment deleted successfully" });
});

export const softDelete = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findOne({ _id: id, isDeleted: false });
  if (!comment) return next(new Error("Comment not found", { cause: 404 }));

  const post = await Post.findOne({ _id: comment.post, isDeleted: false });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const commentOwner = comment.user.toString() == req.user._id.toString();

  const postOwner = post.user.toString() == req.user._id.toString();

  const admin = req.user.role == roles.admin;

  if (!commentOwner && !postOwner && !admin)
    return next(
      new Error("you not authorized to delete this post", { cause: 404 }),
    );

  comment.isDeleted = true;
  comment.deletedBy = req.user._id;
  await comment.save();

  return res.status(200).json({ success: true, comment });
});

export const getComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) return next(new Error("Ivalid post id", { cause: 404 }));

  const comment = await Comment.find({ post: postId, isDeleted: false });
  if (!comment)
    return next(new Error("There is no comment for this post", { cause: 404 }));

  return res.status(200).json({ success: true, comment });
});

export const getComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const comment = await Comment.findOne({ _id: id, isDeleted: false });
  if (!comment)
    return next(new Error("There is no comment for this id", { cause: 404 }));

  return res.status(200).json({ success: true, comment });
});

//* Like/Unlike Comment
export const likeUnlikeComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const comment = await Comment.findOne({ _id: id, isDeleted: false });
  if (!comment) return next(new Error("comment Not Found", { cause: 404 }));

  //* Check if user already liked the post
  const isUserExist = comment.likes.find(
    (user) => user.toString() === userId.toString(),
  );
  //* If not liked yet, like it, else unlike it
  if (!isUserExist) {
    comment.likes.push(userId);
  } else {
    //* filter out the user from the likes array
    comment.likes = comment.likes.filter(
      (user) => user.toString() !== userId.toString(),
    );
  }
  await comment.save();

  const poupulatedComment = await Comment.findById(comment._id).populate({
    path: "likes",
    select: "userName ",
  });

  return res.status(200).json({ success: true, result: poupulatedComment });
});

export const replyToComment = asyncHandler(async (req, res, next) => {
  const { id, postId } = req.params;

  //* get parent comment
  const comment = await Comment.findOne({ _id: id, isDeleted: false });
  if (!comment) return next(new Error("Comment not found", { cause: 404 }));

  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const userPost = await User.findById(post.user);

  let newImage = {};
  if (req.file) {
    //* Logic for updating the image
    //* 1. Upload new image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/users/${userPost.userName}_${post.user}/posts/${post.cloudFolder}/comments/${comment._id}/replies`,
      },
    );

    //* 2. Delete old image if it exists
    if (comment.image && comment.image.public_id) {
      await cloudinary.uploader.destroy(comment.image.public_id);
    }

    //* 3. Update the comment object with new image data
    newImage = { secure_url, public_id };
  }

  const replyComment = await Comment.create({
    text: req.body.text,
    image: newImage,
    post: postId,
    user: req.user._id,
    parentComment: comment._id,
  });

  return res.status(200).json({ success: true, comment: replyComment });
});
