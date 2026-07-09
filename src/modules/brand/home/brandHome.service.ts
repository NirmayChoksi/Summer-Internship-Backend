import { CampaignService } from "../../campaign/campaign.service.js";
import { BrandProfileService } from "../profile/brandProfile.service.js";

export class BrandHomeService {
  private campaignService = new CampaignService();
  private profileService = new BrandProfileService();

  getHome = async (userId: string) => {
    const [profile, overview, activeCampaigns, recentApplications] =
      await Promise.all([
        this.profileService.getProfileSummary(userId),
        this.campaignService.getOverview(userId),
        this.campaignService.getActiveCampaigns(userId),
        this.campaignService.getRecentApplications(userId),
      ]);

    return {
      message: "Home fetched successfully",
      data: {
        profile,
        overview,
        activeCampaigns,
        recentApplications,
      },
    };
  };
}
