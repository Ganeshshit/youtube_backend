import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
// Genarate Token
const genarateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(user);
    const accessToken = user.genarateAccessToken();
    console.log("Access Token:", accessToken);
    const refreshToken = user.genarateRefreshToken();
    console.log("Refresh Token:", refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and acess token"
    );
  }
};

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
  return res.status(201)(
    new ApiResponse(200, createdUser, "User register successFully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, userName } = req.body;
  if (
    !(email && password)
    // []
  ) {
    throw new ApiError(400, "Required  email");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  }); //Check two thing user name or password
  if (!user) {
    throw new ApiError(404, "User Dose not exit");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  // const isPasswordValid = () => {
  //   if (password == user.password) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // if (!isPasswordValid) {
  //   throw new ApiError(404, "Invalid Credential");
  // }
  const { accessToken, refreshToken } = await genarateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = User.findById(user._id).select(
    "-password -refreshToken"
  );
  // Coockies
  const options = { httpOnly: true, secure: true };
  return (
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToke", refreshToken, options)

      //  .json( new ApiResponse(
      //     200,
      //     {
      //       user: loggedInUser,
      //       accessToken,
      //       refreshToken,
      //     },
      //     "User Logedin sucessfully"
      //  )
      // );
      .send({
        succcess: "True",
        accessToken: accessToken,
        refreshToken: refreshToken,
        meassage: "User Login success fully",
      })
  );
});
// Logout

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }
  try {
    const decodedToken = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (incomingRefreshToken!=user?.refreshToken) {
      throw new ApiError(401,"Expired ")
      
    }
    // New Refresh token Genarate
    const options={
      httpOnly:true,secure:true
  
    }
   const {accessToken,newRefreshToken}= await  genarateAccessAndRefreshTokens(user._id)
  
   return res.status(200).cookie("accessToken",accessToken).cookie("refreshToken:",newRefreshToken)
   .json(
    new ApiResponse(
      200,
      {
        accessToken,newRefreshToken
      }
    )
   )
  } catch (error) {
    throw new ApiError(401,error?.meassage,"Invalid")

  }

});

export { registerUser, loginUser, logoutUser,refreshAccessToken };
