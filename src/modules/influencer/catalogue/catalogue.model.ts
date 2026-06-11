import mongoose, { Document, Schema, Types } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { env } from "../../../config/env.js";
import { MODELS } from "../../../shared/types/constants.js";

export interface ICatalogue extends Document {
  profile: Types.ObjectId;
  path: string;
  thumbnailPath?: string;
  name: string;
  type: string;
}

const catalogueSchema = new Schema<ICatalogue>(
  {
    profile: {
      type: Schema.Types.ObjectId,
      ref: MODELS.influencerProfile,
      required: true,
      index: true,
    },

    path: {
      type: String,
      required: true,
    },

    thumbnailPath: {
      type: String,
    },

    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,

    toJSON: { virtuals: true },

    toObject: { virtuals: true },
  },
);

catalogueSchema.virtual("url").get(function () {
  return `${env.BASE_URL}/${this.path}`;
});

catalogueSchema.virtual("thumbnailUrl").get(function () {
  return this.thumbnailPath ? `${env.BASE_URL}/${this.thumbnailPath}` : null;
});

catalogueSchema.plugin(mongooseLeanVirtuals);

export const Catalogue = mongoose.model<ICatalogue>(
  MODELS.catalogue,
  catalogueSchema,
);
