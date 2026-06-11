import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import { UploadService } from "./upload.service.js";

const uploadService = new UploadService();

export const UploadController = {
  uploadCompanyLogo: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await uploadService.uploadCompanyLogo(req.file);

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
