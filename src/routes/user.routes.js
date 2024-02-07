import Router from "express";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccoutDetails,
  updateUserAatar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { veifyJWT } from "../middlewares/auth.middlewere.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    // Two object for two files

    {
      name: "avatar", //Frontend field should be avatar
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// Private route

// router.route("/logout").post(veifyJWT, logoutUser);
// router.route("/refresh-token").post(refreshAccessToken);
// router.route("change-password").post(veifyJWT, changeCurrentUserPassword);
// router.route("/current-user").get(veifyJWT, getCurrentUser);
// router.route("update-acount").patch(veifyJWT, updateAccoutDetails);
// router
//   .route("avatar")
//   .patch(veifyJWT, upload.single("avatar"), updateUserAatar);
// !Write controller Update cover Image

// router.route("/cover-image").patch(veifyJWT,upload.single("/coverImage"),up)

// router.route("/c/:username").get(veifyJWT, getUserChannelProfile);

// router.route("/history").get(veifyJWT, getWatchHistory);
// router.route("acount-details");

export default router;
