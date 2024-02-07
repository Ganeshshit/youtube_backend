import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import { veifyJWT } from "../middlewares/auth.middlewere.js";
import { createBlog, deletePost } from "../controllers/blogpost.controller.js";

const router = Router();

router.route("/").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  createBlog
);
router.route('/:postId').delete(deletePost)
export default router;
