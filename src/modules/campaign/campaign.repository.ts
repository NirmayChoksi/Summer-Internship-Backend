import { QueryFilter, Types, UpdateQuery } from "mongoose";
import { Pagination } from "../../shared/types/interfaces.js";
import { CampaignFilters } from "./campaign.dto.js";
import {
  Campaign,
  ICampaign,
  InfluencerCampaignStatus,
} from "./campaign.model.js";

export class CampaignRepository {
  private CAMPAIGN_POPULATE = [
    {
      path: "brand",
      select: "-user",
    },
    {
      path: "influencers.profile",
      select: "-user",
    },
  ];

  create = async (data: Partial<ICampaign>) => {
    return (await Campaign.create(data)).populate(this.CAMPAIGN_POPULATE);
  };

  find = async (filters: CampaignFilters, shouldPopulate = true) => {
    const { industry, platform, minPayout, maxPayout, page, limit } = filters;

    const query: Record<string, unknown> = {};

    if (industry) query.industry = industry;

    if (platform) query.platforms = platform;

    if (minPayout || maxPayout) {
      query.payout = {};

      if (minPayout) (query.payout as Record<string, number>).$gte = minPayout;

      if (maxPayout) (query.payout as Record<string, number>).$lte = maxPayout;
    }

    const skip = (page - 1) * limit;

    let mongooseQuery = Campaign.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (shouldPopulate) {
      mongooseQuery = mongooseQuery.populate(this.CAMPAIGN_POPULATE);
    }

    const [campaigns, total] = await Promise.all([
      mongooseQuery,
      Campaign.countDocuments(query),
    ]);

    const pagination: Pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };

    return { campaigns, pagination };
  };

  findById = async (id: string, shouldPopulate = false) => {
    let query = Campaign.findById(id);

    if (shouldPopulate) query = query.populate(this.CAMPAIGN_POPULATE);

    return await query;
  };

  findByBrandId = async (brandId: Types.ObjectId) => {
    return await Campaign.find({ brand: brandId }).populate(
      this.CAMPAIGN_POPULATE,
    );
  };

  findByInfluencerId = async (influencerId: Types.ObjectId) => {
    return await Campaign.find({
      "influencers.influencer": influencerId,
    }).populate(this.CAMPAIGN_POPULATE);
  };

  update = async (id: string, query: UpdateQuery<ICampaign>) => {
    return await Campaign.findByIdAndUpdate(id, query, {
      returnDocument: "after",
    }).populate(this.CAMPAIGN_POPULATE);
  };

  updateMany = async (
    filter: QueryFilter<ICampaign>,
    update: UpdateQuery<ICampaign>,
  ) => {
    return await Campaign.updateMany(filter, update);
  };

  joinCampaign = async (
    campaignId: Types.ObjectId,
    influencerId: Types.ObjectId,
  ) => {
    return await Campaign.findOneAndUpdate(
      { _id: campaignId, "influencers.influencer": { $ne: influencerId } },
      {
        $push: {
          influencers: { profile: influencerId },
        },
      },
      { returnDocument: "after" },
    ).populate(this.CAMPAIGN_POPULATE);
  };

  leaveCampaign = async (
    campaignId: Types.ObjectId,
    influencerId: Types.ObjectId,
  ) => {
    return await Campaign.findByIdAndUpdate(
      campaignId,
      {
        $pull: {
          influencers: { profile: influencerId },
        },
      },
      { returnDocument: "after" },
    ).populate(this.CAMPAIGN_POPULATE);
  };

  updateInfluencerStatus = async (
    campaignId: string,
    influencerId: string,
    status: InfluencerCampaignStatus,
    query: UpdateQuery<ICampaign>,
  ) => {
    return await Campaign.findOneAndUpdate(
      {
        _id: campaignId,
        "influencers.profile": new Types.ObjectId(influencerId),
      },
      { $set: { "influencers.$.status": status }, ...query },
      { returnDocument: "after" },
    ).populate(this.CAMPAIGN_POPULATE);
  };

  delete = async (id: string) => {
    return await Campaign.findByIdAndDelete(id);
  };
}
