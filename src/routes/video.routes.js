import { Router } from "express";
import { veifyJWT } from "../middlewares/auth.middlewere.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getAllVideoos,
  getVideoById,
  videoPublish,
} from "../controllers/video.contoller.js";

const router = Router();

// router.use(veifyJWT);

router
  .route("/")
  .get(getAllVideoos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      // {
      //   name: "thumbnail",
      //   maxCount: 1,
      // },
    ]),

    videoPublish
  );

router.route("/:videoId").get(getVideoById);

export default router;
