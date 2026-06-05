import z from "zod";
import { Niche, Platform, PlatformName } from "./influencerProfile.model.js";

const validPlatforms = Object.values(Platform).map(
  (p) => p.toLowerCase() as PlatformName,
);

const platformStatsSchema = z
  .object({ username: z.string().min(1), followers: z.number().positive() })
  .optional();

const baseInfluencerProfileSchema = z.object({
  bio: z.string().min(10),
  niche: z.array(z.enum(Niche)),
  country: z.string(),
  platforms: z.record(
    z.enum(validPlatforms as [string, ...string[]]),
    platformStatsSchema,
  ),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  pastWorks: z.array(z.url()),
});

export const createInfluencerProfileDto = baseInfluencerProfileSchema.refine(
  (data) => Object.keys(data.platforms).length > 0,
  {
    message: "At least one social account is required",
    path: ["platforms"],
  },
);

export const updateInfluencerProfileDto = baseInfluencerProfileSchema.partial();

export type CreateInfluencerProfileDto = z.infer<
  typeof createInfluencerProfileDto
>;

export type UpdateInfluencerProfileDto = z.infer<
  typeof updateInfluencerProfileDto
>;
