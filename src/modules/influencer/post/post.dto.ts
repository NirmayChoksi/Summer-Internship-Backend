import z from "zod";

export const generateCaptionDto = z.object({
  
  userText: z.string().optional(),
});

export type GenerateCaptionDto = z.infer<typeof generateCaptionDto>;

export const publishMediaDto = z.object({
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  caption: z.string().optional().default(""),
  isReel: z.boolean().default(false),
});

export type PublishMediaDto = z.infer<typeof publishMediaDto>;
