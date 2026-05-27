import { Router } from "express";
import { UploadController } from "./upload.controller.js";
import { uploadCompanyLogo } from "./upload.middleware.js";

export const UploadRouter = Router();

UploadRouter.post(
  "/company-logo",
  uploadCompanyLogo,
  UploadController.uploadCompanyLogo,
);
