import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import Post from "../../DB/model/post.model.js";
import cloudinary from "../../utils/fileUploading/cloudinary.config.js";
import { nanoid } from "nanoid";
import User, { roles } from "../../DB/model/user.model.js";
import Comment from "../../DB/model/comment.model.js";

//* Create Post
export const createPost = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  const images = [];
  const cloudFolder = nanoid();

  if (req.files?.length) {
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.CLOUD_FOLDER_NAME}/users/${req.user.userName}_${req.user._id}/posts/${cloudFolder}`,
        },
      );

      images.push({ secure_url, public_id });
    }
  }

  const post = await Post.create({
    text,
    images,
    cloudFolder,
    user: req.user._id,
  });

  res.status(201).json({ success: true, result: { post } });
});

//* Update Post */
export const updatePost = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  const { id } = req.params;

  const post = await Post.findOne({ _id: id, user: req.user._id });
  if (!post) return next(new Error("Post Not Found", { cause: 404 }));

  if (req.files?.length) {
    const oldImages = [...post.images];
    const newImages = [];

    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.CLOUD_FOLDER_NAME}/users/${req.user.userName}_${req.user._id}/posts/${post.cloudFolder}`,
        },
      );

      newImages.push({ secure_url, public_id });
    }

    //* delete old images
    for (const image of oldImages) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    //* now assign new images
    post.images = newImages;
  }

  post.text = text || post.text;
  await post.save();

  res.status(200).json({ success: true, result: { post } });
});

//* Get All unDeleted Posts
export const getAllActivePosts = asyncHandler(async (req, res, next) => {
  //   const posts = await Post.find({ isDeleted: false });
  //   if (!posts) return next(new Error(`Posts not found`, { cause: 404 }));
  let posts;

  if (req.user.role === roles.admin) {
    posts = await Post.find({ isDeleted: false }).populate({
      path: "user",
      select: "userName ",
    });
  } else if (req.user.role === roles.user) {
    posts = await Post.find({ isDeleted: false, user: req.user._id }).populate({
      path: "user",
      select: "userName ",
    });
  }

  return res
    .status(200)
    .json({ success: true, Count: posts.length, result: posts });
});

//* Get All Deleted Posts
export const getAllDeletedPosts = asyncHandler(async (req, res, next) => {
  let posts;

  if (req.user.role === roles.admin) {
    posts = await Post.find({ isDeleted: true }).populate({
      path: "user",
      select: "userName ",
    });
  } else if (req.user.role === roles.user) {
    posts = await Post.find({ isDeleted: true, user: req.user._id }).populate({
      path: "user",
      select: "userName ",
    });

    return res
      .status(200)
      .json({ success: true, Count: posts.length, result: posts });
  }
});

//* Get Post By Id
export const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).populate([
    {
      path: "user",
      select: "userName",
    },
    {
      path: "likes",
      select: "userName",
    },
    {
      path: "comments",
      select: "text image createdAt user",
      match: { parentComment: null, isDeleted: false },
      populate: [
        {
          path: "user",
          select: "userName profileCloudPicture",
        },
        {
          path: "replies",
          match: { isDeleted: false },
          populate: {
            path: "user",
            select: "userName profileCloudPicture",
          },
        },
      ],
    },
  ]);

  if (!post) return next(new Error(`Post not found`, { cause: 404 }));

  // const comment = await Comment.find({ post: post._id, isDeleted: false });

  return res.status(200).json({ success: true, result: { post } });
});

//* Delete Post
export const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findOne({ _id: id, user: req.user._id });
  if (!post) {
    return next(new Error("Post Not Found or Unauthorized", { cause: 404 }));
  }

  await post.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

//* Freeze Post
export const freezePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return next(new Error("Post Not Found", { cause: 404 }));

  if (
    post.user.toString() === req.user._id.toString() ||
    req.user.role === roles.admin
  ) {
    post.isDeleted = true;
    post.deletedBy = req.user._id;
    await post.save();
  }

  return res.status(200).json({ success: true, result: post });
});

//* Restore Post
export const restorePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findOne({
    _id: id,
    user: req.user._id,
    isDeleted: true,
  });
  if (!post) return next(new Error("Post Not Found", { cause: 404 }));

  post.isDeleted = false;
  post.deletedBy = null;
  await post.save();

  return res.status(200).json({ success: true, result: post });
});

//* Like/Unlike Post
export const likeUnlikePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const post = await Post.findOne({ _id: id, isDeleted: false });
  if (!post) return next(new Error("Post Not Found", { cause: 404 }));

  //* Check if user already liked the post
  const isUserExist = post.likes.find(
    (user) => user.toString() === userId.toString(),
  );
  //* If not liked yet, like it, else unlike it
  if (!isUserExist) {
    post.likes.push(userId);
  } else {
    //* filter out the user from the likes array
    post.likes = post.likes.filter(
      (user) => user.toString() !== userId.toString(),
    );
  }
  await post.save();

  const poupulatedPost = await Post.findById(post._id).populate({
    path: "likes",
    select: "userName ",
  });

  return res.status(200).json({ success: true, result: poupulatedPost });
});
