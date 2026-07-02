import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BASE_URL: z.url().default("http://localhost:3000"),
  META_APP_ID: z.coerce.number(),
  META_APP_SECRET: z.string(),
  META_REDIRECT_URI: z.url(),
  INSTAGRAM_APP_ID: z.string(),
  INSTAGRAM_APP_SECRET: z.string(),
  INSTAGRAM_REDIRECT_URI: z.url(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.email(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
