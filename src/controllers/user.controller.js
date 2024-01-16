import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;
  console.log("Email:", email);
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw ApiError(400, "All field are required");
  }
  // Check User Exit or not
  const exitedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  console.log(exitedUser);

  if (exitedUser) {
    throw new ApiError(400, "User with email or user Name already exited");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // Manual way to check coer image are present or not
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  console.log(req.files);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,

    coverImage: coverImage?.url || "",
    userName: userName.toLowerCase(),
    email,
    password,
  });
  const createdUser = await User.findById(user._id).select(
    // Dont want this field
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something erro");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register successFully"));
});

const loginUser = asyncHandler(async (req, res) => {
 const {email,password}=req.body;
 if (
  []
 ) {
  
 }
});

export { registerUser, loginUser };
