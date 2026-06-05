import z from "zod";
import { objectIdSchema } from "../../shared/utils/validator.js";
import { UserRole } from "../user/user.model.js";

export const registerDto = z.object({
  email: z.email().transform((val) => val.toLowerCase()),
  role: z.enum(UserRole),
});

export type RegisterDto = z.infer<typeof registerDto>;

export const verifyOtpDto = z.object({
  id: objectIdSchema,
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;

export const resendOtpDto = z.object({
  email: z.email().transform((val) => val.toLowerCase()),
});

export const createPasswordDto = z
  .object({
    id: objectIdSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreatePasswordDto = z.infer<typeof createPasswordDto>;

export const loginDto = z.object({
  email: z.email().transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
  role: z.enum(UserRole),
});

export type LoginDto = z.infer<typeof loginDto>;
