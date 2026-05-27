import { NextFunction, Request, Response } from "express";

import { BadRequestError } from "../../shared/utils/appError.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";

export const UploadController = {
  uploadCompanyLogo: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.file) throw new BadRequestError("Company logo not uploaded");

      return ApiResponse.success(res, {
        url: `uploads/companyLogos/${req.file.filename}`,
      });
    } catch (error) {
      next(error);
    }
  },
};
