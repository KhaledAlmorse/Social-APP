import { asyncHandler } from "../../utils/errorHandling/asyncHandler.js";
import { decrypt, encrypt } from "../../utils/encryption/encryption.js";
import User from "../../DB/model/user.model.js";
import { compareHash, hash } from "../../utils/hashing/hash.js";

export const Profile = asyncHandler(async (req, res, next) => {
  try {
    const { user } = req;
    //* decrypt phone (omit decrypt when no ciphertext — old users or never set)
    const phone = user.phone
      ? decrypt({ cipherText: user.phone })
      : null;

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
    { new: true, runValidators: true }
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
    { new: true, runValidators: true }
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
