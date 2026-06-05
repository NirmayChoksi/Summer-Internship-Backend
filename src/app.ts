import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { AuthRouter } from "./modules/auth/auth.routes.js";
import { BrandRouter } from "./modules/brand/brand.routes.js";
import { InfluencerRouter } from "./modules/influencer/influencer.routes.js";
import { UploadRouter } from "./modules/upload/upload.routes.js";
import { authMiddleware } from "./shared/middlewares/auth.middleware.js";
import { errorMiddleware } from "./shared/middlewares/error.middleware.js";
import { CampaignRouter } from "./modules/campaign/campaign.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Too many requests, slow down." },
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", AuthRouter);

app.use(authMiddleware);

app.use("/upload", UploadRouter);

app.use("/brand", BrandRouter);

app.use("/influencer", InfluencerRouter);

app.use("/campaign", CampaignRouter);

app.use((_req, res) =>
  res.status(404).json({ success: false, error: "Route not found" }),
);

app.use(errorMiddleware);

export default app;
