import Post from "../../DB/model/post.model.js";
import User from "../../DB/model/user.model.js";
import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";

export const getAllUsersAndPosts = asyncHandler(async (req, res, next) => {
  const results = await Promise.all([User.find(), Post.find()]);

  res.status(200).json({ success: true, result: results });
});

export const changeRole = asyncHandler(async (req, res, next) => {
  //*
  const { userId, newRole } = req.body;
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { role: newRole },
    { new: true },
  );

  if (!user) return next(new Error("User not found", { cause: 404 }));
  res.status(200).json({ success: true, result: user });
});
