import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const ACCESS_TOKEN_SECRET = "rlrvllvlkvmlmrlvlnklnii8508590fnlvlvlkld";
const REFRESH_TOKE_SECRET = "lksjdckKLJKllklnkn";
const REFRESH_TOKE_Expiry = "10d";

const ACCESS_TOKEN_EXPIRY = "1d";
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      tirm: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      tirm: true,
    },
    fullName: {
      type: String,
      required: true,
      tirm: true,
      index: true,
    },
    avatar: {
      type: String, //Cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //Cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.genarateAccessToken = function () {
  return jwt.sign(
    {
      // !Payload
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET || ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.genarateRefreshToken = function () {
  return jwt.sign(
    {
      // !Payload
      _id: this._id,
    },
    process.env.REFRESH_TOKE_SECRET || REFRESH_TOKE_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKE_EXPIRY || REFRESH_TOKE_Expiry,
    }
  );
};

export const User = new mongoose.model("User", userSchema);
