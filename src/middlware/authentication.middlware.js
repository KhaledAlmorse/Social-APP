import User from "../DB/model/user.model.js";
import { verifyToken } from "../utils/token/token.js";

const isAuthenticated = async (req, res, next) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    )
      return next(new Error("Bearer Token Required!", { cause: 403 }));

    //* get token
    const token = req.headers.authorization.split(" ")[1];

    //* verify token
    const { id } = verifyToken({ token });
    //* check User
    const user = await User.findById(id).select("-password").lean();

    if (!user) return next(new Error("User not found!", { cause: 400 }));

    if (!user.isLoggedIn) return next(new Error("Try to login again!"));

    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};

export default isAuthenticated;
