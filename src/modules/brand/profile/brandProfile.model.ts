import mongoose, { Document, Schema, Types } from "mongoose";
import { env } from "../../../config/env.js";

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
  industry: Industry;
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
      ref: "User",
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
      type: String,
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

    toJSON: {
      transform: (_doc, ret) => {
        if (ret.companyLogo) {
          ret.companyLogo = `${env.BASE_URL}/${ret.companyLogo}`;
        }

        return ret;
      },
    },

    toObject: {
      transform: (_doc, ret) => {
        if (ret.companyLogo) {
          ret.companyLogo = `${env.BASE_URL}/${ret.companyLogo}`;
        }

        return ret;
      },
    },
  },
);

export const BrandProfile = mongoose.model<IBrandProfile>(
  "BrandProfile",
  brandProfileSchema,
);
