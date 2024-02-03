import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//import mongoose, { Aggregate } from "mongoose";
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
  // console.log(incomingRefreshToken)
  if (incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }
  // try {
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET || "lksjdckKLJKllklnkn"
  );
  console.log(decodedToken);
  const user = User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }
  if (incomingRefreshToken != user?.refreshToken) {
    throw new ApiError(401, "Expired ");
  }
  // New Refresh token Genarate
  const options = {
    httpOnly: true,
    secure: true,
  };
  const { accessToken, newRefreshToken } = await genarateAccessAndRefreshTokens(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken:", newRefreshToken)
    .json(
      new ApiResponse(200, {
        accessToken,
        newRefreshToken,
      })
    );
  // }

  // catch (error) {
  //   throw new ApiError(401,error?.meassage||"Error are here","Invalid")

  // }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password Chane Success"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Currecnt UserFetched successfully");
});

const updateAccoutDetails = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All field Are required");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,

    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    new true()
  ).select("-password");
  return res
    .status(200)
    .json(new ApiError(200, user, "Account Details updated Sucessfully"));
});

const updateUserAatar = asyncHandler(async (req, res) => {
  const avatartLocalPath = req.file?.path;
  if (!avatartLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = uploadOnCloudinary(avatartLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Api error while uploading on avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Update Avatar successfully"));
});

// !Update Cover image

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  console.log(username)
  if (!username?.trim()) {
    throw new ApiError(400, "UserName Misssing");
  }

  const chanel = await User.aggregate([
    {
      $match: {
        userName: username?.toLowerCase(),
      },
    },

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "chanel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscriber: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },

            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar1: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!chanel?.length) {
    throw new ApiError(404, "Chnel Not Found");
  }
  console.log(chanel[0])

  return res
    .status(200)
    // .send({
    //   succcess:true,
    //   meassage:"Channel Found Sucesfully",
    //   chanel
    // })
    .json(new ApiResponse(200, chanel[0], "User Found Sucess fully"));
});

// Get User Watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].getWatchHistory,
        "Watch History get Successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserAatar,
  updateAccoutDetails,
  getUserChannelProfile,
  changeCurrentUserPassword,
  getCurrentUser,
  getWatchHistory,
};
