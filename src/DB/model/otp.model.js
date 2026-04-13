import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required.."],
      lowercase: true,
      match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    otp: {
      type: String,
      required: [true, "otp is required.."],
    },
  },
  { timestamps: true }
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 480 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;