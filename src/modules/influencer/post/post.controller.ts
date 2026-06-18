import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../shared/utils/apiResponse.js";
import {
  GenerateCaptionDto,
  PublishMediaDto,
  RefineCaptionDto,
} from "./post.dto.js";
import { PostService } from "./post.service.js";

const postService = new PostService();

export const PostController = {
  generateCaption: async (
    req: Request<unknown, unknown, GenerateCaptionDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await postService.generateCaptionWithGemini(
        req.body.userText,
        req.file,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  refineCaption: async (
    req: Request<unknown, unknown, RefineCaptionDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await postService.refineCaptionWithGemini(
        req.body.caption,
        req.body.caption,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  publishMedia: async (
    req: Request<unknown, unknown, PublishMediaDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await postService.publishMedia(req.user!.id, req.body);

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
