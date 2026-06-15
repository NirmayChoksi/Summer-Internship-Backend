import mongoose, { Document, Schema, Types } from "mongoose";

export enum Niche {
  Technology = "TECHNOLOGY",
  Fashion = "FASHION",
  Food = "FOOD",
  Finance = "FINANCE",
}

export interface PlatformStats {
  username: string;
  followers: number;
  token?: string;
  userId?: string;
}

export interface IInfluencerProfile extends Document {
  user: Types.ObjectId;
  bio: string;
  niche: Niche[];
  country: string;
  instagram: PlatformStats;
  twitter?: PlatformStats;
  youtube?: PlatformStats;
  pastWorks: string[];
  firstName: string;
  lastName: string;
  isVerified: boolean;
}

const platformStatsSchema = new Schema<PlatformStats>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    followers: {
      type: Number,
      required: true,
      min: 0,
    },

    token: {
      type: String,
      required: false,
      select: false,
    },

    userId: {
      type: String,
      required: false,
      select: false,
    },
  },
  { _id: false },
);

const influencerProfileSchema = new Schema<IInfluencerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
    },

    niche: {
      type: [String],
      enum: Object.values(Niche),
      required: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    instagram: {
      type: platformStatsSchema,
      required: true,
    },

    twitter: {
      type: platformStatsSchema,
      required: false,
    },

    youtube: {
      type: platformStatsSchema,
      required: false,
    },

    pastWorks: {
      type: [String],
      default: [],
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const InfluencerProfile = mongoose.model<IInfluencerProfile>(
  "InfluencerProfile",
  influencerProfileSchema,
);
