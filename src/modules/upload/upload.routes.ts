import { Router } from "express";
import { UploadController } from "./upload.controller.js";
import { uploadCompanyLogo, uploadPost } from "./upload.middleware.js";

export const UploadRouter = Router();

UploadRouter.post(
  "/company-logo",
  uploadCompanyLogo,
  UploadController.uploadCompanyLogo,
);

UploadRouter.post("/post", uploadPost, UploadController.uploadPost);
