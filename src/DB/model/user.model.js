import mongoose from "mongoose";
import { hash } from "../../utils/hashing/hash.js";

export const roles = {
  user: "user",
  admin: "admin",
};

export const providers = {
  google: "google",
  system: "system",
};

export const defaultProfilePic = "Uploads//defualt.jpg";

export const defulatSecure_Url =
  "https://res.cloudinary.com/dihye61vh/image/upload/v1776524705/defualt_ynt7rq.jpg";

export const defulatPublic_Id = "defualt_ynt7rq";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      minlength: 5,
      maxlength: 15,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email Already Existed!"],
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == providers.system ? true : false;
      },
    },
    phone: {
      type: String,
      default: null,
    },
    isAcctivated: {
      type: Boolean,
      default: false,
    },
    role: { type: String, enum: Object.values(roles), default: roles.user },
    isLoggedIn: { type: Boolean, default: false },
    freezed: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: Object.values(providers),
      default: providers.system,
    },
    tempEmail: { type: String, default: null },
    profilePicture: { type: String, default: defaultProfilePic },
    profileCloudPicture: {
      secure_url: { type: String, default: defulatSecure_Url },
      public_id: { type: String, default: defulatPublic_Id },
    },
    coverPicts: [String],
  },
  { timestamps: true, requierd: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hash({ plainText: this.password });
  }
});

const User = mongoose.model("User", userSchema);

export default User;
