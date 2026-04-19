import fs from "fs";
import path from "path";

import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import { decrypt, encrypt } from "../../utils/encryption/encryption.js";
import User, {
  defaultProfilePic,
  defulatSecure_Url,
  defulatPublic_Id,
} from "../../DB/model/user.model.js";
import { compareHash, hash } from "../../utils/hashing/hash.js";
import { generateToken, verifyToken } from "../../utils/token/token.js";
import { vefifyEmail } from "../../utils/emails/generateHtml.js";
import { sendEmail, subjects } from "../../utils/emails/sendEmail.js";
import cloudinary from "../../utils/fileUploading/cloudinary.config.js";

export const Profile = asyncHandler(async (req, res, next) => {
  try {
    const { user } = req;
    //* decrypt phone (omit decrypt when no ciphertext — old users or never set)
    const phone = user.phone ? decrypt({ cipherText: user.phone }) : null;

    res.status(200).json({ sucess: true, result: { ...user, phone } });
  } catch (error) {
    return next(error);
  }
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { user } = req;

  if (req.body.phone) {
    req.body.phone = encrypt({ plainText: req.body.phone });
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { ...req.body },
    { new: true, runValidators: true },
  ).select("-password");

  return res
    .status(200)
    .json({ sucsess: true, message: "Updated Sucessfully!", updatedUser });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { oldPassword, newPassword } = req.body;

  const findUser = await User.findById(user._id);
  if (!findUser) return next(new Error("User Not found", { cause: 404 }));

  if (!compareHash({ plainText: oldPassword, hash: findUser.password })) {
    return next(new Error("Inccorect old Password", { cause: 404 }));
  }

  const updatedUser = await User.findByIdAndUpdate(
    findUser._id,
    {
      isLoggedIn: false,
    },
    { new: true, runValidators: true },
  );

  return res.status(200).json({
    sucsess: true,
    message: "updated Password Sucsessfully!",
    updatedUser,
  });
});

export const deactivateAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id);

  if (!compareHash({ plainText: password, hash: user.password }))
    return next(new Error("Invalid password", { cause: 400 }));

  user.freezed = true;
  user.isLoggedIn = false;
  await user.save();

  return res
    .status(200)
    .json({ sucess: true, message: "Account deactivated!" });
});

export const updateEmail = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return next(new Error("User Not found", { cause: 404 }));

  if (!compareHash({ plainText: password, hash: user.password }))
    return next(new Error("Invalid Password.."));

  user.tempEmail = email;
  await user.save();

  const token = generateToken({ payload: { email: user.email, id: user._id } });
  const url = `http://localhost:8000/user/verify_email/${token}`;
  await sendEmail({
    to: email,
    subject: subjects.verifyEmail,
    html: vefifyEmail(url),
  });
  return res
    .status(200)
    .json({ success: true, message: "Verify Email Sent.." });
});

export const verify_Email = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email, id } = verifyToken({ token });
  console.log(token);
  console.log(email, id);

  const user = await User.findById(id);
  if (!user) return next(new Error("User Not found", { cause: 404 }));
  user.email = user.tempEmail;
  user.tempEmail = null;
  user.isAcctivated = true;
  await user.save();
  return res.status(200).json({ success: true, message: "Email Verified.." });
});

export const profilePicture = asyncHandler(async (req, res, next) => {
  // image => req.file
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      profilePicture: req.file.path,
    },
    { new: true },
  );

  return res.status(200).json({ success: true, result: user });
});

export const coverPictures = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new Error("Invalid User Id", { cause: 400 }));

  user.coverPicts = req.files.map((file) => file.path);
  await user.save();

  return res.status(200).json({ success: true, results: { user } });
});

export const deleteProfilePicture = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const imagePath = path.resolve(".", user.profilePicture);
  fs.unlinkSync(imagePath);

  user.profilePicture = defaultProfilePic;
  await user.save();

  return res.status(200).json({ sucsess: true, result: user });
});

//* Cloudinary
export const profilePictureCloud = asyncHandler(async (req, res, next) => {
  // image => req.file
  const user = await User.findById(req.user._id);
  if (!user) return next(new Error("Ivalid User Id", { cause: 400 }));
  // if file exist upload file in cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/users/${user.userName}_${user.id}/ProfilePictures`,
    },
  );

  user.profileCloudPicture = { secure_url, public_id };
  await user.save();

  //save the url link on image that clodinary give it to me
  return res.status(200).json({ success: true, result: { user } });
});

export const deleteProfilePicCloud = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  // delete image from clouidnary
  const results = await cloudinary.uploader.destroy(
    user.profileCloudPicture.public_id,
  );

  if (results.result == "ok") {
    user.profileCloudPicture = {
      secure_url: defulatSecure_Url,
      public_id: defulatPublic_Id,
    };
    await user.save();
  }

  // to delete folder from Cloudinary
  //1- Delete all resources inside the folder

  // const folderPath = `Users/${user.userName}_${user.id}/ProfilePictures`;
  // await cloudinary.api.delete_resources_by_prefix(folderPath + "/");

  //2- Then delete the folder
  //await cloudinary.api.delete_folder(folderPath);

  return res.status(200).json({
    sucsess: true,
    result: { user },
  });
});
