import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { User } from "../models/user.mode.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createBlog = asyncHandler(async (req, res) => {
  const { heading, content } = req.body;
  const imageLocalPath = req.files?.image[0]?.path;
  console.log(imageLocalPath);
  const imageUrl = await uploadOnCloudinary(imageLocalPath);
  console.log(imageUrl);
  if (!imageUrl) {
    throw new ApiError(400, "Face problem on uplode images");
  }
  console.log(imageUrl);
  const blog = await Tweet.create({
    image: imageUrl.url,
    heading: heading,
    content: content,
  });
  return res.status(200).send({
    sucess: true,
    data: blog,
    meassage: "Successfully Update",
  });
});
const updatePost = asyncHandler(async (req, res) => {});
const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params;
  console.log(postId)
  const deletePost = await Tweet.findOne(postId);
  console.log(deletePost.heading)
  if (deletePost._id===postId) {
    console.log(deletePost._id)
  }
  console.log(deletePost)
  if (!deletePost) {
    throw new ApiError(400, "Psot Not found");
  }
  return res.status(200).json(new ApiResponse(200, "sucessfully Delte post"));
});
export { createBlog ,deletePost};
