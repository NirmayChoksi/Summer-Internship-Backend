import mongoose, { Document, Schema, Types } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { env } from "../../../config/env.js";
import { MODELS } from "../../../shared/types/constants.js";

export enum Industry {
  Technology = "TECHNOLOGY",
  Fashion = "FASHION",
  Food = "FOOD",
  Finance = "FINANCE",
}

export interface Budget {
  min: number;
  max: number;
}

export interface IBrandProfile extends Document {
  user: Types.ObjectId;
  companyLogo: string;
  companyName: string;
  description: string;
  website: string;
  industry: Industry[];
  budget: Budget;
  firstName: string;
  lastName: string;
  contactNumber: string;
}

const budgetSchema = new Schema<Budget>(
  {
    min: {
      type: Number,
      required: true,
      min: 0,
    },

    max: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const brandProfileSchema = new Schema<IBrandProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: MODELS.user,
      required: true,
      unique: true,
      index: true,
    },

    companyLogo: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    website: {
      type: String,
      required: true,
      trim: true,
    },

    industry: {
      type: [String],
      enum: Object.values(Industry),
      required: true,
    },

    budget: {
      type: budgetSchema,
      required: true,
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

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,

    toJSON: { virtuals: true },

    toObject: { virtuals: true },
  },
);

brandProfileSchema.virtual("companyLogoUrl").get(function () {
  return `${env.BASE_URL}/${this.companyLogo}`;
});

brandProfileSchema.plugin(mongooseLeanVirtuals);

export const BrandProfile = mongoose.model<IBrandProfile>(
  MODELS.brandProfile,
  brandProfileSchema,
);
