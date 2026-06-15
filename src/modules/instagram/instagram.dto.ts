import z from "zod";

export const instagramExchangeDto = z.object({
  code: z.string(),
});

export type InstagramExchangeDto = z.infer<typeof instagramExchangeDto>;
