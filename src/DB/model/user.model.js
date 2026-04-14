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
