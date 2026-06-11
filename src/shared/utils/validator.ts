import mongoose from "mongoose";
import { z } from "zod";

export const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  });

export const createIdParamSchema = <T extends string>(key: T) => {
  return z.object({
    [key]: objectIdSchema,
  } as Record<T, typeof objectIdSchema>);
};

export const userIdParamSchema = createIdParamSchema("userId");

export type UserIdParam = z.infer<typeof userIdParamSchema>;

export const brandIdParamSchema = createIdParamSchema("brandId");

export type BrandIdParam = z.infer<typeof brandIdParamSchema>;

export const influencerIdParamSchema = createIdParamSchema("influencerId");

export type InfluencerIdParam = z.infer<typeof influencerIdParamSchema>;

export const campaignIdParamSchema = createIdParamSchema("campaignId");

export type CampaignIdParam = z.infer<typeof campaignIdParamSchema>;

export const catalogueIdParamSchema = createIdParamSchema("catalogueId");

export type CatalogueIdParam = z.infer<typeof catalogueIdParamSchema>;
