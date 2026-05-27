import { ObjectId } from "mongodb";
import { z } from "zod";

export const objectIdSchema = z.string().refine((id) => ObjectId.isValid(id), {
  message: "Invalid ObjectId",
});

export const userIdParamSchema = z.object({
  userId: objectIdSchema,
});

export type UserIdParams = z.infer<typeof userIdParamSchema>;

export const profileIdParamSchema = z.object({
  profileId: objectIdSchema,
});

export type ProfileIdParams = z.infer<typeof profileIdParamSchema>;
