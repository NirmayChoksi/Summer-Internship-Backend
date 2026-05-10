import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { errorMiddleware } from "./shared/middlewares/error.middleware.js";

const app = express();

app.use(helmet());
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

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((_req, res) =>
  res.status(404).json({ success: false, error: "Route not found" }),
);

app.use(errorMiddleware);

export default app;
