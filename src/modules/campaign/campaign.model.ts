import mongoose, { Document, Schema, Types } from "mongoose";
import { MODELS } from "../../shared/types/constants.js";
import { Industry } from "../brand/profile/brandProfile.model.js";
import { Platform } from "../influencer/profile/influencerProfile.model.js";

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

export interface CampaignInfluencer {
  profile: Types.ObjectId;
  status: InfluencerCampaignStatus;
}

export interface ICampaign extends Document {
  brand: Types.ObjectId;
  title: string;
  industry: Industry;
  description: string;
  platforms: Platform[];
  payout: number;
  startDate: Date;
  endDate: Date;
  maximumInfluencers: number;
  acceptedInfluencersCount: number;
  status: CampaignStatus;
  influencers: CampaignInfluencer[];
}

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
      enum: Object.values(Industry),
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

export const Campaign = mongoose.model<ICampaign>(
  MODELS.campaign,
  campaignSchema,
);
