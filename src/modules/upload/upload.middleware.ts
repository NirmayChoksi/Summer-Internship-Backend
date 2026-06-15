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

const catalogueFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "video/x-matroska",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only images, PDFs and Word documents are allowed"));
  }
};

const postFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "video/x-matroska",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only images, PDFs and Word documents are allowed"));
  }
};

const createUploadMiddleware = ({
  folder,
  fileFilter,
  maxSize = 5 * 1024 * 1024,
}: {
  folder: string;
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => void;
  maxSize?: number;
}) =>
  multer({
    storage: diskStorage(folder),
    fileFilter,
    limits: {
      fileSize: maxSize,
    },
  });

export const uploadCompanyLogo = createUploadMiddleware({
  folder: "companyLogos",
  fileFilter: imageFilter,
}).single("companyLogo");

export const uploadProfilePicture = createUploadMiddleware({
  folder: "profilePictures",
  fileFilter: imageFilter,
}).single("profilePicture");

export const uploadDocument = createUploadMiddleware({
  folder: "documents",
  fileFilter: documentFilter,
  maxSize: 10 * 1024 * 1024,
}).single("document");

export const uploadCatalogue = createUploadMiddleware({
  folder: "catalogues",
  fileFilter: catalogueFilter,
  maxSize: 20 * 1024 * 1024,
}).array("catalogues", 20);

export const uploadPost = createUploadMiddleware({
  folder: "posts",
  fileFilter: postFilter,
  maxSize: 20 * 1024 * 1024,
}).single("post");
