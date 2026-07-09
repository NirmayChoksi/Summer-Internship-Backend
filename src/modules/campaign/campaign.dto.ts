import z from "zod";
import { Category } from "../../shared/types/enums.js";
import { objectIdSchema } from "../../shared/utils/validator.js";
import { InfluencerCampaignStatus, Platform } from "./campaign.model.js";

export const createCampaignDto = z.object({
  title: z.string().min(5),
  industry: z.enum(Category),
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
  industry: z.enum(Category).optional(),
  platform: z.string().optional(),
  minPayout: z.coerce.number().optional(),
  maxPayout: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type CampaignFilters = z.infer<typeof campaignQuerySchema>;

export const generateCaptionDto = z.object({
  userText: z.string().optional(),
});

export type GenerateCaptionDto = z.infer<typeof generateCaptionDto>;

export const refineCaptionDto = z.object({
  caption: z.string().min(1),
  instruction: z.string().min(1),
});

export type RefineCaptionDto = z.infer<typeof refineCaptionDto>;

export const submitCampaignPostDto = z
  .object({
    caption: z.string().min(1),
    imageUrl: z.string().optional(),
    videoUrl: z.string().optional(),
  })
  .refine((data) => !!data.imageUrl || !!data.videoUrl, {
    message: "Either imageUrl or videoUrl is required.",
    path: ["imageUrl"],
  });

export type SubmitCampaignPostDto = z.infer<typeof submitCampaignPostDto>;
