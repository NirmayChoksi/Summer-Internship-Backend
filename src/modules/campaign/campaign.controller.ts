import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import {
  BrandIdParam,
  CampaignIdParam,
  InfluencerIdParam,
} from "../../shared/utils/validator.js";
import {
  CampaignFilters,
  ChangeInfluencerStatusDto,
  CreateCampaignDto,
  GenerateCaptionDto,
  RefineCaptionDto,
  SubmitCampaignPostDto,
  UpdateCampaignDto,
} from "./campaign.dto.js";
import { CampaignService } from "./campaign.service.js";

const campaignService = new CampaignService();

export const CampaignController = {
  create: async (
    req: Request<unknown, unknown, CreateCampaignDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.createCampaign(
        req.user!.id,
        req.body,
      );

      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await campaignService.getCampaigns(
        req.user!.id,
        req.user!.role,
        req.validatedQuery as CampaignFilters,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (
    req: Request<CampaignIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.getCampaignById(
        req.params.campaignId,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByBrandId: async (
    req: Request<BrandIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.getCampaignsByBrandId(
        req.params.brandId,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByInfluencerId: async (
    req: Request<InfluencerIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.getCampaignsByInfluencerId(
        req.params.influencerId,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  joinCampaign: async (
    req: Request<CampaignIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.joinCampaign(
        req.params.campaignId,
        req.user!.id,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  leaveCampaign: async (
    req: Request<CampaignIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.leaveCampaign(
        req.params.campaignId,
        req.user!.id,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  changeInfluencerStatus: async (
    req: Request<CampaignIdParam, unknown, ChangeInfluencerStatusDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.changeInfluencerStatus(
        req.params.campaignId,
        req.user!.id,
        req.body,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  update: async (
    req: Request<CampaignIdParam, unknown, UpdateCampaignDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.updateCampaign(
        req.params.campaignId,
        req.user!.id,
        req.body,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  delete: async (
    req: Request<CampaignIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.deleteCampaign(
        req.params.campaignId,
        req.user!.id,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  generateCaption: async (
    req: Request<CampaignIdParam, unknown, GenerateCaptionDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.generateCampaignCaption(
        req.params.campaignId,
        req.user!.id,
        req.body.userText,
        req.file!,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  refineCaption: async (
    req: Request<CampaignIdParam, unknown, RefineCaptionDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.refineCampaignCaption(
        req.params.campaignId,
        req.user!.id,
        req.body.caption,
        req.body.instruction,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  submitPost: async (
    req: Request<CampaignIdParam, unknown, SubmitCampaignPostDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await campaignService.submitCampaignPost(
        req.params.campaignId,
        req.user!.id,
        req.body,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
