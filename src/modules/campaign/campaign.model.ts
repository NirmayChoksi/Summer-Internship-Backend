import mongoose, { Document, Schema, Types } from "mongoose";
import { MODELS } from "../../shared/types/constants.js";
import { Category } from "../../shared/types/enums.js";

export enum CampaignStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Completed = "COMPLETED",
}

export enum InfluencerCampaignStatus {
  Pending = "PENDING",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
}

export enum Platform {
  Instagram = "INSTAGRAM",
  Twitter = "TWITTER",
  Youtube = "YOUTUBE",
}

export interface CampaignPost {
  mediaId: string;
  caption: string;
  submittedAt: Date;
}

export interface CampaignInfluencer {
  profile: Types.ObjectId;
  status: InfluencerCampaignStatus;
  post?: string;
}

export interface ICampaign extends Document {
  brand: Types.ObjectId;
  title: string;
  industry: Category;
  description: string;
  platforms: Platform[];
  payout: number;
  startDate: Date;
  endDate: Date;
  maximumInfluencers: number;
  acceptedInfluencersCount: number;
  status: CampaignStatus;
  influencers: CampaignInfluencer[];
  createdAt: string;
}

const campaignPostSchema = new Schema<CampaignPost>(
  {
    mediaId: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const influencerCampaignSchema = new Schema<CampaignInfluencer>(
  {
    profile: {
      type: Schema.Types.ObjectId,
      ref: MODELS.influencerProfile,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(InfluencerCampaignStatus),
      default: InfluencerCampaignStatus.Pending,
    },

    post: campaignPostSchema,
  },
  { _id: false },
);

const campaignSchema = new Schema<ICampaign>(
  {
    brand: {
      type: Schema.Types.ObjectId,
      ref: MODELS.brandProfile,
      required: true,
      index: true,
    },

    industry: {
      type: String,
      enum: Object.values(Category),
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    platforms: [
      {
        type: String,
        enum: Object.values(Platform),
        required: true,
      },
    ],

    payout: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    maximumInfluencers: {
      type: Number,
      required: true,
    },

    acceptedInfluencersCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.Active,
    },

    influencers: [influencerCampaignSchema],
  },
  { timestamps: true },
);

campaignSchema.index({
  status: 1,
  endDate: 1,
});

export const Campaign = mongoose.model<ICampaign>(
  MODELS.campaign,
  campaignSchema,
);
