import { Request } from "express";
import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { BadRequestError } from "../../shared/utils/appError.js";

const diskStorage = (folder: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = `uploads/${folder}`;

      fs.mkdirSync(uploadPath, {
        recursive: true,
      });

      cb(null, uploadPath);
    },

    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);

      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      cb(null, `${folder}-${unique}${ext}`);
    },
  });

const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only JPEG, PNG, and WebP images are allowed"));
  }
};

const documentFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only PDF and Word documents are allowed"));
  }
};

// const anyFilter = (
//   _req: Request,
//   _file: Express.Multer.File,
//   cb: FileFilterCallback,
// ) => {
//   cb(null, true);
// };

export const uploadCompanyLogo = multer({
  storage: diskStorage("companyLogos"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("companyLogo");

export const uploadDocument = multer({
  storage: diskStorage("documents"),
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("document");

export const uploadGallery = multer({
  storage: diskStorage("gallery"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 10);
