import { QueryFilter, Types, UpdateQuery } from "mongoose";
import { Pagination } from "../../shared/types/interfaces.js";
import { CampaignFilters } from "./campaign.dto.js";
import {
  Campaign,
  CampaignStatus,
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
      "influencers.profile": influencerId,
    }).populate(this.CAMPAIGN_POPULATE);
  };

  getApplicationsByInfluencer = async (
    influencerId: Types.ObjectId,
    limit = 5,
  ) => {
    return Campaign.find({
      "influencers.profile": influencerId,
    })
      .select("title payout endDate status influencers brand")
      .populate({
        path: "brand",
        select: "companyName logo",
      })
      .sort({ updatedAt: -1 })
      .limit(limit);
  };

  getOpenCampaigns = async (influencerId: Types.ObjectId, limit = 30) => {
    return Campaign.find({
      status: {
        $ne: CampaignStatus.Completed,
      },

      endDate: {
        $gt: new Date(),
      },

      "influencers.profile": {
        $ne: influencerId,
      },

      $expr: {
        $lt: ["$acceptedInfluencersCount", "$maximumInfluencers"],
      },
    })
      .select(
        "title description industry platforms payout endDate createdAt brand",
      )
      .populate({
        path: "brand",
        select: "companyName logo",
      })
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .lean();
  };

  getOverview = async (brandId: Types.ObjectId) => {
    const [overview] = await Campaign.aggregate([
      {
        $match: {
          brand: brandId,
        },
      },

      {
        $group: {
          _id: null,

          activeCampaigns: {
            $sum: {
              $cond: [{ $eq: ["$status", CampaignStatus.Active] }, 1, 0],
            },
          },

          completedCampaigns: {
            $sum: {
              $cond: [{ $eq: ["$status", CampaignStatus.Completed] }, 1, 0],
            },
          },

          totalApplications: {
            $sum: {
              $size: "$influencers",
            },
          },

          acceptedApplications: {
            $sum: "$acceptedInfluencersCount",
          },
        },
      },
    ]);

    return (
      overview ?? {
        activeCampaigns: 0,
        completedCampaigns: 0,
        totalApplications: 0,
        acceptedApplications: 0,
      }
    );
  };

  getActiveCampaigns = async (brandId: Types.ObjectId, limit = 5) => {
    return Campaign.find({
      brand: brandId,

      status: CampaignStatus.Active,
    })
      .select(
        "title payout endDate acceptedInfluencersCount maximumInfluencers",
      )
      .sort({
        endDate: 1,
      })
      .limit(limit)
      .lean();
  };

  getRecentApplications = async (brandId: Types.ObjectId, limit = 5) => {
    return Campaign.find({
      brand: brandId,
      influencers: {
        $exists: true,
        $ne: [],
      },
    })
      .select("title updatedAt influencers")
      .populate({
        path: "influencers.profile",
        select: "firstName lastName instagram",
      })
      .sort({
        updatedAt: -1,
      })
      .limit(limit)
      .lean();
  };

  update = async (id: string, query: UpdateQuery<ICampaign>) => {
    return Campaign.findByIdAndUpdate(id, query, {
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
      { _id: campaignId, "influencers.profile": { $ne: influencerId } },
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
