import Router from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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


router.route("/logout").post(veifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;
