import { Router } from "express";
import { BrandHomeController } from "./brandHome.controller.js";

export const BrandHomeRouter = Router();

BrandHomeRouter.get("/", BrandHomeController.get);
