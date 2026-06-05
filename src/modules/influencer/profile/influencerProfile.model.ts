import mongoose, { Document, Schema, Types } from "mongoose";

export enum Niche {
  Technology = "TECHNOLOGY",
  Fashion = "FASHION",
  Food = "FOOD",
  Finance = "FINANCE",
}

export enum Platform {
  Instagram = "INSTAGRAM",
  Twitter = "TWITTER",
  Youtube = "YOUTUBE",
}

export interface PlatformStats {
  username: string;
  followers: number;
}

export type PlatformName = Lowercase<Platform>;

export type Platforms = Partial<Record<PlatformName, PlatformStats>>;
export interface IInfluencerProfile extends Document {
  user: Types.ObjectId;
  bio: string;
  niche: Niche[];
  country: string;
  platforms: Platforms;
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
  },
  { _id: false },
);

const validPlatforms = Object.values(Platform).map(
  (p) => p.toLowerCase() as PlatformName,
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

    platforms: {
      type: Map,
      of: platformStatsSchema,
      default: {},
      validate: {
        validator(value?: Map<string, PlatformStats>) {
          if (!value) return false;

          return (
            value.size > 0 &&
            [...value.keys()].every((key) =>
              validPlatforms.includes(key as PlatformName),
            )
          );
        },
        message: "At least one valid platform is required",
      },
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
