import { Router } from "express";
import { HomeController } from "./influencerHome.controller.js";

export const InfluencerHomeRouter = Router();

InfluencerHomeRouter.get("/", HomeController.get);
