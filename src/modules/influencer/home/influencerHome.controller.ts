import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../shared/utils/apiResponse.js";
import { HomeService } from "./influencerHome.service.js";

const homeService = new HomeService();

export const HomeController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await homeService.getHome(req.user!.id);

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
