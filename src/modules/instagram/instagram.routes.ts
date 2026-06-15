import { Router } from "express";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { InstagramController } from "./instagram.controller.js";
import { instagramExchangeDto } from "./instagram.dto.js";

export const InstagramRouter = Router();

InstagramRouter.post(
  "/exchange",
  validate({ body: instagramExchangeDto }),
  InstagramController.exchange,
);
