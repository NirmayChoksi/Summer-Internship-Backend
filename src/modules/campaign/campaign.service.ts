import { Types, UpdateQuery } from "mongoose";
import { emailService } from "../../shared/services/email.services.js";
import { campaignStatusTemplate } from "../../shared/templates/campaign-status.template.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/utils/appError.js";
import { removeUndefinedFields } from "../../shared/utils/removeUndefinedFields.js";
import { BrandProfileRepository } from "../brand/profile/brandProfile.repository.js";
import { InfluencerProfileRepository } from "../influencer/profile/influencerProfile.repository.js";
import { IUser, UserRole } from "../user/user.model.js";
import {
  CampaignFilters,
  ChangeInfluencerStatusDto,
  CreateCampaignDto,
  UpdateCampaignDto,
} from "./campaign.dto.js";
import {
  CampaignInfluencer,
  CampaignStatus,
  ICampaign,
  InfluencerCampaignStatus,
} from "./campaign.model.js";
import { CampaignRepository } from "./campaign.repository.js";

export class CampaignService {
  private brandProfileRepo = new BrandProfileRepository();
  private campaignRepo = new CampaignRepository();
  private influencerProfileRepo = new InfluencerProfileRepository();

  createCampaign = async (userId: string, data: CreateCampaignDto) => {
    const brandProfile = await this._getBrandProfileByUserId(userId);

    let status: CampaignStatus = CampaignStatus.Inactive;

    if (data.startDate <= new Date()) {
      status = CampaignStatus.Active;
    }

    const campaign = await this.campaignRepo.create({
      brand: brandProfile._id,
      status,
      ...data,
    });

    return { message: "Campaign created successfully", campaign };
  };

  getCampaigns = async (
    userId: string,
    role: UserRole,
    query: CampaignFilters,
  ) => {
    const { campaigns, pagination } = await this.campaignRepo.find(query, true);

    if (role === UserRole.Influencer) {
      const influencerProfile =
        await this._getInfluencerProfileByUserId(userId);

      const transformedCampaigns = campaigns.map((campaign) => {
        return this._toInfluencerCampaign(
          campaign,
          this._findCampaignInfluencer(campaign, influencerProfile._id, true) ??
            null,
        );
      });

      return {
        message: "Campaigns fetched successfully",
        campaigns: transformedCampaigns,
        pagination,
      };
    }

    return { message: "Campaigns fetched successfully", campaigns };
  };

  getCampaignById = async (campaignId: string) => {
    const campaign = await this._getCampaign(campaignId, true);

    return { message: "Campaign fetched successfully", campaign };
  };

  getCampaignsByBrandId = async (brandId: string) => {
    const campaigns = await this.campaignRepo.findByBrandId(
      new Types.ObjectId(brandId),
    );

    return { message: "Campaigns fetched successfully", campaigns };
  };

  getCampaignsByInfluencerId = async (influencerId: string) => {
    const campaigns = await this.campaignRepo.findByInfluencerId(
      new Types.ObjectId(influencerId),
    );

    return { message: "Campaigns fetched successfully", campaigns };
  };

  joinCampaign = async (campaignId: string, userId: string) => {
    const campaign = await this._getCampaign(campaignId);

    this._assertCampaignIsActive(campaign);

    const influencerProfile = await this._getInfluencerProfileByUserId(userId);

    if (campaign.acceptedInfluencersCount >= campaign.maximumInfluencers)
      throw new ConflictError(
        "Campaign has reached maximum number of influencers",
      );

    const existingInfluencer = this._findCampaignInfluencer(
      campaign,
      influencerProfile._id,
    );

    if (existingInfluencer)
      throw new ConflictError("Influencer has already joined this campaign");

    const updatedCampaign = await this.campaignRepo.joinCampaign(
      campaign._id,
      influencerProfile._id,
    );

    if (!updatedCampaign) throw new NotFoundError("Campaign not found");

    return {
      message: "Joined campaign successfully",
      campaign: this._toInfluencerCampaign(updatedCampaign, {
        profile: influencerProfile._id,
        status: InfluencerCampaignStatus.Pending,
      }),
    };
  };

  leaveCampaign = async (campaignId: string, userId: string) => {
    const campaign = await this._getCampaign(campaignId);

    this._assertCampaignIsActive(campaign);

    const influencerProfile = await this._getInfluencerProfileByUserId(userId);

    const existingInfluencer = this._findCampaignInfluencer(
      campaign,
      influencerProfile._id,
    );

    if (!existingInfluencer)
      throw new NotFoundError("Influencer has not joined this campaign");

    if (existingInfluencer.status === InfluencerCampaignStatus.Accepted)
      throw new ConflictError(
        "Cannot leave campaign after being accepted. Try contacting the brand.",
      );

    const updatedCampaign = await this.campaignRepo.leaveCampaign(
      campaign._id,
      influencerProfile._id,
    );

    if (!updatedCampaign) throw new NotFoundError("Campaign not found");

    return {
      message: "Left campaign successfully",
      campaign: this._toInfluencerCampaign(updatedCampaign, null),
    };
  };

  changeInfluencerStatus = async (
    campaignId: string,
    userId: string,
    data: ChangeInfluencerStatusDto,
  ) => {
    const campaign = await this._getCampaign(campaignId);

    this._assertCampaignIsActive(campaign);

    const brandProfile = await this._getBrandProfileByUserId(userId);

    this._assertCampaignOwnership(campaign, String(brandProfile._id));

    const influencerProfile = await this._getInfluencerProfile(
      data.influencerId,
      true,
    );

    const existingInfluencer = this._findCampaignInfluencer(
      campaign,
      influencerProfile._id,
    );

    if (!existingInfluencer)
      throw new NotFoundError("Influencer has not joined this campaign");

    if (data.status === InfluencerCampaignStatus.Pending)
      throw new ConflictError("Cannot change status to pending");

    if (existingInfluencer.status === data.status)
      throw new ConflictError(
        `Influencer is already ${data.status.toLowerCase()}`,
      );

    if (
      data.status === InfluencerCampaignStatus.Accepted &&
      campaign.acceptedInfluencersCount >= campaign.maximumInfluencers
    )
      throw new ConflictError(
        "Campaign has reached maximum number of influencers",
      );

    const query: UpdateQuery<ICampaign> = {};

    if (
      existingInfluencer.status !== InfluencerCampaignStatus.Accepted &&
      data.status === InfluencerCampaignStatus.Accepted
    )
      query.$inc = { acceptedInfluencersCount: 1 };

    if (
      existingInfluencer.status === InfluencerCampaignStatus.Accepted &&
      data.status !== InfluencerCampaignStatus.Accepted
    )
      query.$inc = { acceptedInfluencersCount: -1 };

    const updatedCampaign = await this.campaignRepo.updateInfluencerStatus(
      String(campaign._id),
      String(influencerProfile._id),
      data.status,
      query,
    );

    if (data.status === InfluencerCampaignStatus.Accepted)
      await emailService.sendMail({
        to: (influencerProfile.user as unknown as IUser).email,
        subject: "You've Been Accepted!",
        html: campaignStatusTemplate(
          `${influencerProfile.firstName} ${influencerProfile.lastName}`,
          campaign.title,
          brandProfile.companyName,
          InfluencerCampaignStatus.Accepted,
        ),
      });
    else if (data.status === InfluencerCampaignStatus.Rejected)
      await emailService.sendMail({
        to: (influencerProfile.user as unknown as IUser).email,
        subject: "Campaign Application Update",
        html: campaignStatusTemplate(
          `${influencerProfile.firstName} ${influencerProfile.lastName}`,
          campaign.title,
          brandProfile.companyName,
          InfluencerCampaignStatus.Rejected,
        ),
      });

    return {
      message: "Influencer status updated successfully",
      campaign: updatedCampaign,
    };
  };

  updateCampaign = async (
    campaignId: string,
    userId: string,
    data: UpdateCampaignDto,
  ) => {
    const campaign = await this._getCampaign(campaignId);

    this._assertCampaignIsActive(campaign);

    const brandProfile = await this._getBrandProfileByUserId(userId);

    this._assertCampaignOwnership(campaign, String(brandProfile._id));

    const updateData = removeUndefinedFields(data);

    const query: UpdateQuery<ICampaign> = {
      $set: updateData,
    };

    const updatedCampaign = await this.campaignRepo.update(
      String(campaign._id),
      query,
    );

    return {
      message: "Campaign updated successfully",
      campaign: updatedCampaign,
    };
  };

  updateCampaignStatuses = async () => {
    const now = new Date();
    console.log(now);

    await this.campaignRepo.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gt: now },
        status: CampaignStatus.Inactive,
      },
      {
        $set: {
          status: CampaignStatus.Active,
        },
      },
    );

    await this.campaignRepo.updateMany(
      {
        endDate: { $lte: now },
        status: {
          $nin: [CampaignStatus.Completed],
        },
      },
      {
        $set: {
          status: CampaignStatus.Completed,
        },
      },
    );
  };

  deleteCampaign = async (campaignId: string, userId: string) => {
    const campaign = await this._getCampaign(campaignId);

    this._assertCampaignIsActive(campaign);

    const brandProfile = await this._getBrandProfileByUserId(userId);

    this._assertCampaignOwnership(campaign, String(brandProfile._id));

    //TODO: Confirm if we should allow deleting campaigns with joined influencers
    if (campaign.influencers.length > 0)
      throw new ConflictError(
        "Cannot delete campaign with joined influencers.",
      );

    await this.campaignRepo.delete(campaignId);

    return { message: "Campaign deleted successfully" };
  };

  private _assertCampaignIsActive = (campaign: ICampaign) => {
    if (campaign.status !== CampaignStatus.Active)
      throw new ConflictError("Campaign is not active");

    if (campaign.endDate < new Date())
      throw new ConflictError("Campaign has already ended");
  };

  private _assertCampaignOwnership = (campaign: ICampaign, brandId: string) => {
    if (String(campaign.brand) !== brandId)
      throw new ForbiddenError("Brand does not own this campaign");
  };

  private _findCampaignInfluencer = (
    campaign: ICampaign,
    influencerId: Types.ObjectId,
    isPopulated: boolean = false,
  ) => {
    const id = String(influencerId);

    return campaign.influencers.find(
      ({ profile }) => String(isPopulated ? profile._id : profile) === id,
    );
  };

  private _getBrandProfileByUserId = async (userId: string) => {
    const brand = await this.brandProfileRepo.findByUserId(
      new Types.ObjectId(userId),
    );

    if (!brand) throw new NotFoundError("Brand profile not found");

    return brand;
  };

  private _getCampaign = async (campaignId: string, shouldPopulate = false) => {
    const campaign = await this.campaignRepo.findById(
      campaignId,
      shouldPopulate,
    );

    if (!campaign) throw new NotFoundError("Campaign not found");

    return campaign;
  };

  private _getInfluencerProfile = async (
    influencerId: string,
    populateUser?: boolean,
  ) => {
    const influencer = await this.influencerProfileRepo.findById(
      influencerId,
      populateUser,
    );

    if (!influencer) throw new NotFoundError("Influencer profile not found");

    return influencer;
  };

  private _getInfluencerProfileByUserId = async (userId: string) => {
    const influencer = await this.influencerProfileRepo.findByUserId(
      new Types.ObjectId(userId),
    );

    if (!influencer) throw new NotFoundError("Influencer profile not found");

    return influencer;
  };

  private _toInfluencerCampaign(
    campaign: ICampaign,
    myApplication: CampaignInfluencer | null,
  ) {
    const { influencers, ...campaignData } = campaign.toObject();

    return {
      ...campaignData,
      myApplication,
    };
  }
}
