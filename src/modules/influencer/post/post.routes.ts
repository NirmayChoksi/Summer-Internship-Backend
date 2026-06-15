import { Router } from "express";
import { validate } from "../../../shared/middlewares/validate.middleware.js";
import { uploadPost } from "../../upload/upload.middleware.js";
import { PostController } from "./post.controller.js";
import { generateCaptionDto, publishMediaDto } from "./post.dto.js";

export const PostRouter = Router();

PostRouter.post(
  "/generate-caption",
  uploadPost,
  validate({ body: generateCaptionDto }),
  PostController.generateCaption,
);

PostRouter.post(
  "/publish-media",
  validate({ body: publishMediaDto }),
  PostController.publishMedia,
);
