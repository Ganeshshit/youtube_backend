import  Router  from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
const router = Router();
  router.route("/register").post(
    upload.fields([
      // Two object for two files

      {
        name:"avatar",//Frontend field should be avatar
        maxCount:1
      },
      {
        name:"coverImage",
        maxCount:1
      }
    ]),
    registerUser);
export default router
