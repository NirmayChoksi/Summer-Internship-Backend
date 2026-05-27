import z from "zod";
import { objectIdSchema } from "../../../shared/utils/validator.js";
import { Niche } from "./influencerProfile.model.js";

const platformSchema = z
  .object({ username: z.string().min(1), followers: z.number().positive() })
  .optional();

const baseInfluencerProfileSchema = z.object({
  bio: z.string().min(10),
  niche: z.array(z.enum(Niche)),
  country: z.string(),
  instagram: platformSchema,
  twitter: platformSchema,
  youtube: platformSchema,
  pastWorks: z.array(z.url()),
});

export const createInfluencerProfileDto = baseInfluencerProfileSchema.refine(
  (data) => data.instagram || data.twitter || data.youtube,
  { message: "At least one social account is required", path: ["instagram"] },
);

export const updateInfluencerProfileDto = baseInfluencerProfileSchema.partial();

export type CreateInfluencerProfileDto = z.infer<
  typeof createInfluencerProfileDto
>;

export type UpdateInfluencerProfileDto = z.infer<
  typeof updateInfluencerProfileDto
>;
