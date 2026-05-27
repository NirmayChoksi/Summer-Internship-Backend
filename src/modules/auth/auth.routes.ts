import { Router } from "express";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { AuthController } from "./auth.controller.js";
import {
  createPasswordDto,
  loginDto,
  registerDto,
  resendOtpDto,
  verifyOtpDto,
} from "./auth.dto.js";

export const AuthRouter = Router();

AuthRouter.post(
  "/register",
  validate({ body: registerDto }),
  AuthController.register,
);

AuthRouter.post(
  "/verify-otp",
  validate({ body: verifyOtpDto }),
  AuthController.verifyOtp,
);

AuthRouter.post(
  "/resend-otp",
  validate({ body: resendOtpDto }),
  AuthController.resendOtp,
);

AuthRouter.post(
  "/create-password",
  validate({ body: createPasswordDto }),
  AuthController.createPassword,
);

AuthRouter.post("/login", validate({ body: loginDto }), AuthController.login);
