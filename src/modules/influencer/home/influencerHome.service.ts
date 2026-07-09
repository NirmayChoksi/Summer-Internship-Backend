import { CampaignService } from "../../campaign/campaign.service.js";
import { InfluencerProfileService } from "../profile/influencerProfile.service.js";

export class HomeService {
  private campaignService = new CampaignService();
  private profileService = new InfluencerProfileService();

  getHome = async (userId: string) => {
    const [profile, recommendedCampaigns, myApplications, insights] =
      await Promise.all([
        this.profileService.getProfileSummary(userId),
        this.campaignService.getRecommendedCampaigns(userId),
        this.campaignService.getMyApplications(userId),
        this.profileService.getProfileInsights(userId),
      ]);

    return {
      message: "Home fetched successfully",
      data: {
        profile,
        insights,
        recommendedCampaigns,
        myApplications,
      },
    };
  };
}
