import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../shared/utils/apiResponse.js";
import { BrandHomeService } from "./brandHome.service.js";

const brandHomeService = new BrandHomeService();

export const BrandHomeController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await brandHomeService.getHome(req.user!.id);

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
