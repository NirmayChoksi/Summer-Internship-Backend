import z from "zod";
import { Niche } from "./influencerProfile.model.js";

const platformStatsSchema = z.object({
  username: z.string().min(1),
  followers: z.number().int().positive(),
});

const instagramCreateSchema = platformStatsSchema.extend({
  token: z.string().min(1),
  userId: z.string().min(1),
});

const baseInfluencerProfileSchema = z.object({
  bio: z.string().min(10),
  niche: z.array(z.enum(Niche)),
  country: z.string(),
  instagram: instagramCreateSchema,
  twitter: platformStatsSchema.optional(),
  youtube: platformStatsSchema.optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  pastWorks: z.array(z.url()),
});

export const createInfluencerProfileDto = baseInfluencerProfileSchema;

export type CreateInfluencerProfileDto = z.infer<
  typeof createInfluencerProfileDto
>;

export const updateInfluencerProfileDto = baseInfluencerProfileSchema.partial();

export type UpdateInfluencerProfileDto = z.infer<
  typeof updateInfluencerProfileDto
>;

export const connectInstagramDto = z.object({
  code: z.string(),
});
