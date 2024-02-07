import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const videoPublish = asyncHandler(async (req, res) => {
  // const { titel, description } = req.body;
  const titel = req.body;
  console.log(titel);
  const description = req.body;
  console.log(description);
  // console.table(titel, description);
  const videoLocalpath = req.files?.videoFile[0]?.path;
  const videourl = await uploadOnCloudinary(videoLocalpath);
  console.log("Responces:", videourl.duration);
    console.log(videourl);
  if (!videourl) {
    throw new ApiError(400, "Face problem Uploaded file");
  }
  const videoData = await Video.create({
    titel,
    description,
    videoFile: videourl.url,
    duration: videourl.duration / 100,
  });

  return res.status(200).send({
    success: true,
    data: videoData,
  });
});

const getAllVideoos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
  const filter = {};
  if (query) {
    filter.titel = { $regex: new RegExp(query, "i") };
  }
  if (req.user && req.user._id) {
    filter.userId = req.user._id;
  }
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "desc" ? -1 : 1;
  }

  try {
    const videos = await Video.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Recomended videos are"));
  } catch (error) {
    console.log(error);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const videoId = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(200, "Video Didi not found Wrong video id");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Found sucessfullly"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { titel, description } = req.body;
  const existinVideo = Video.findById(videoId);
  if (!existinVideo) {
    throw new ApiError(200, "Video Not found Crea a new video");
  }
  existinVideo.titel = titel;
  existinVideo.description = description;
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export { videoPublish, getAllVideoos, getVideoById };
