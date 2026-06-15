import { Router } from "express";
import { validate } from "../../../shared/middlewares/validate.middleware.js";
import { catalogueIdParamSchema } from "../../../shared/utils/validator.js";
import { uploadCatalogue } from "../../upload/upload.middleware.js";
import { CatalogueController } from "./catalogue.controller.js";
import {
  deleteManyCataloguesDto,
  getInstagramMediaDto,
} from "./catalogue.dto.js";

export const CatalogueRouter = Router();

CatalogueRouter.post("/", uploadCatalogue, CatalogueController.createMany);

CatalogueRouter.get("/", CatalogueController.getMyCatalogue);

CatalogueRouter.get(
  "/instagram-media",
  validate({ query: getInstagramMediaDto }),
  CatalogueController.getInstagramMedia,
);

CatalogueRouter.delete(
  "/bulk",
  validate({ body: deleteManyCataloguesDto }),
  CatalogueController.deleteMany,
);

CatalogueRouter.delete(
  "/:catalogueId",
  validate({ params: catalogueIdParamSchema }),
  CatalogueController.delete,
);
