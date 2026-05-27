import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import { AuthService } from "./auth.service.js";

const authService = new AuthService();

export const AuthController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);

      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.verifyOtp(req.body);

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  resendOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resendOtp(req.body.email);

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  createPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.createPassword(req.body);

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
