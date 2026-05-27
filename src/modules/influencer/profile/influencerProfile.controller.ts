import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../shared/utils/apiResponse.js";
import {
  ProfileIdParams,
  UserIdParams,
} from "../../../shared/utils/validator.js";
import { InfluencerProfileService } from "./influencerProfile.service.js";

const influencerProfileService = new InfluencerProfileService();

export const InfluencerProfileController = {
  create: async (
    req: Request<UserIdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await influencerProfileService.createInfluencerProfile(
        req.params.userId,
        req.body,
      );

      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (
    req: Request<ProfileIdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await influencerProfileService.getInfluencerProfileById(
        req.params.profileId,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByUserId: async (
    req: Request<UserIdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result =
        await influencerProfileService.getInfluencerProfileByUserId(
          req.params.userId,
        );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  update: async (
    req: Request<ProfileIdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await influencerProfileService.updateInfluencerProfile(
        req.params.profileId,
        req.body,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
