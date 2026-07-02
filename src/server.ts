import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]);

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./database/connection.js";
import { logger } from "./shared/utils/logger.js";
import { startCampaignStatusJob } from "./shared/jobs/campaignStatus.job.js";

async function bootstrap() {
  await connectDB();

  const campaignJob = startCampaignStatusJob();
  logger.info("Background cron schedules initialized.");

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      const { disconnectDB } = await import("./database/connection.js");
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap();
