import { z } from "zod";
import { objectIdSchema } from "../../../shared/utils/validator.js";

export const deleteManyCataloguesDto = z.object({
  catalogueIds: z
    .array(objectIdSchema)
    .min(1, "At least one catalogue is required"),
});

export const getInstagramMediaDto = z.object({
  after: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
});

export type GetInstagramMediaDto = z.infer<typeof getInstagramMediaDto>;

export type DeleteManyCataloguesDto = z.infer<typeof deleteManyCataloguesDto>;
