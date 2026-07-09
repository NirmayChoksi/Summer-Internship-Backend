import cron, { ScheduledTask } from "node-cron";
import { CampaignService } from "../../modules/campaign/campaign.service.js";
import { logger } from "../utils/logger.js";

const campaignService = new CampaignService();
let isJobRunning = false;

export const startCampaignStatusJob = (): ScheduledTask => {
  return cron.schedule("*/5 * * * *", async () => {
    if (isJobRunning) {
      logger.warn(
        "Campaign status job skipped: Previous execution is still active.",
      );
      return;
    }

    try {
      isJobRunning = true;
      await campaignService.updateCampaignStatuses();
      logger.info("Campaign status job completed");
    } catch (error) {
      logger.error("Campaign status job failed", error);
    } finally {
      isJobRunning = false;
    }
  });
};
