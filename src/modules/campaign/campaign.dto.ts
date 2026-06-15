import z from "zod";
import { objectIdSchema } from "../../shared/utils/validator.js";
import { Industry } from "../brand/profile/brandProfile.model.js";
import { InfluencerCampaignStatus, Platform } from "./campaign.model.js";

export const createCampaignDto = z.object({
  title: z.string().min(5),
  industry: z.enum(Industry),
  description: z.string().min(20),
  platforms: z
    .array(z.enum(Platform))
    .min(1, "At least one platform is required"),
  payout: z.number().min(0),
  startDate: z.coerce
    .date()
    .refine((date) => date > new Date(), "End date must be in the future"),
  endDate: z.coerce
    .date()
    .refine((date) => date > new Date(), "End date must be in the future"),
  maximumInfluencers: z.number().min(1),
});

export type CreateCampaignDto = z.infer<typeof createCampaignDto>;

export const updateCampaignDto = createCampaignDto.partial();

export type UpdateCampaignDto = z.infer<typeof updateCampaignDto>;

export const changeInfluencerStatusDto = z.object({
  influencerId: objectIdSchema,
  status: z.enum(InfluencerCampaignStatus),
});

export type ChangeInfluencerStatusDto = z.infer<
  typeof changeInfluencerStatusDto
>;

export const brandIdQuerySchema = z.object({ brandId: objectIdSchema });

export type BrandIdQuery = z.infer<typeof brandIdQuerySchema>;

export const campaignQuerySchema = z.object({
  industry: z.enum(Industry).optional(),
  platform: z.string().optional(),
  minPayout: z.coerce.number().optional(),
  maxPayout: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type CampaignFilters = z.infer<typeof campaignQuerySchema>;
