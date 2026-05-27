import z from "zod";
import { Industry } from "./brandProfile.model.js";

const baseBrandProfileSchema = z.object({
  companyLogo: z.string(),
  companyName: z.string().min(2),
  description: z.string().min(20),
  website: z.string().url(),
  industry: z.enum(Industry),
  budget: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .refine((data) => data.max >= data.min, {
      message: "Maximum budget must be greater than minimum budget",
      path: ["max"],
    }),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  contactNumber: z.string().min(8),
});

export const createBrandProfileDto = baseBrandProfileSchema;

export type CreateBrandProfileDto = z.infer<typeof createBrandProfileDto>;

export const updateBrandProfileDto = baseBrandProfileSchema.partial();

export type UpdateBrandProfileDto = z.infer<typeof updateBrandProfileDto>;
