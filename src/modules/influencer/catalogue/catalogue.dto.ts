import { z } from "zod";
import { objectIdSchema } from "../../../shared/utils/validator.js";

export const deleteManyCataloguesDto = z.object({
  catalogueIds: z
    .array(objectIdSchema)
    .min(1, "At least one catalogue is required"),
});

export type DeleteManyCataloguesDto = z.infer<typeof deleteManyCataloguesDto>;
