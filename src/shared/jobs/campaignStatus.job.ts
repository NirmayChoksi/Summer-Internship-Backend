import cron from "node-cron";
import { CampaignService } from "../../modules/campaign/campaign.service.js";
import { logger } from "../utils/logger.js";

const campaignService = new CampaignService();

export const startCampaignStatusJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      await campaignService.updateCampaignStatuses();

      logger.info("Campaign status job completed");
    } catch (error) {
      logger.error("Campaign status job failed", error);
    }
  });
};
