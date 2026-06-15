import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../shared/utils/apiResponse.js";
import { InfluencerIdParam } from "../../../shared/utils/validator.js";
import { InfluencerProfileService } from "./influencerProfile.service.js";

const influencerProfileService = new InfluencerProfileService();

export const InfluencerProfileController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await influencerProfileService.createInfluencerProfile(
        req.user!.id,
        req.body,
      );

      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (
    req: Request<InfluencerIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await influencerProfileService.getInfluencerProfileById(
        req.params.influencerId,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByUserId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result =
        await influencerProfileService.getInfluencerProfileByUserId(
          req.user!.id,
        );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  refreshInstagramFollowers: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await influencerProfileService.refreshInstagramFollowers(
        req.user!.id,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  update: async (
    req: Request<InfluencerIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await influencerProfileService.updateInfluencerProfile(
        req.params.influencerId,
        req.body,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
