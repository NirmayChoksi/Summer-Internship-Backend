import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../shared/utils/apiResponse.js";
import { CatalogueService } from "./catalogue.service.js";

const catalogueService = new CatalogueService();

export const CatalogueController = {
  createMany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];

      const result = await catalogueService.createMany(req.user!.id, files);

      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  getMyCatalogue: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await catalogueService.getMyCatalogue(req.user!.id);

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  delete: async (
    req: Request<{ catalogueId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await catalogueService.deleteCatalogue(
        req.params.catalogueId,
        req.user!.id,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  deleteMany: async (
    req: Request<unknown, unknown, { catalogueIds: string[] }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await catalogueService.deleteMany(
        req.body.catalogueIds,
        req.user!.id,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
