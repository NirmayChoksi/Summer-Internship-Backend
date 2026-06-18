import z from "zod";

export const generateCaptionDto = z.object({
  userText: z.string().optional(),
});

export type GenerateCaptionDto = z.infer<typeof generateCaptionDto>;

export const refineCaptionDto = z.object({
  caption: z.string().min(1),
  instruction: z.string().min(1),
});

export type RefineCaptionDto = z.infer<typeof refineCaptionDto>;

export const publishMediaDto = z.object({
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  caption: z.string().optional().default(""),
});

export type PublishMediaDto = z.infer<typeof publishMediaDto>;
