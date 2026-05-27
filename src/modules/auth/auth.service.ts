import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UpdateQuery } from "mongoose";
import { env } from "../../config/env.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/utils/appError.js";
import { IUser, UserRole } from "../user/user.model.js";
import { UserRepository } from "../user/user.repository.js";
import {
  CreatePasswordDto,
  LoginDto,
  RegisterDto,
  VerifyOtpDto,
} from "./auth.dto.js";

export class AuthService {
  private userRepo = new UserRepository();

  register = async (data: RegisterDto) => {
    const existingUser = await this.userRepo.findByEmail(data.email);

    if (existingUser?.isProfileComplete) {
      throw new ConflictError("Account with this email already exists");
    }

    const otp = this._generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (existingUser) {
      const query: UpdateQuery<IUser> = {
        $set: {
          role: data.role,
          otp,
          otpExpiresAt,
        },
      };

      const updatedUser = await this.userRepo.update(
        String(existingUser._id),
        query,
      );

      return this.buildAuthResponse(updatedUser!, "OTP resent successfully");
    }

    const user = await this.userRepo.create({
      ...data,
      otp,
      otpExpiresAt,
    });

    return {
      message: "User registered successfully",
      id: String(user._id),
      isOtpVerified: user.isOtpVerified,
      isProfileComplete: user.isProfileComplete,
      isPasswordCreated: !!user.password,
    };
  };

  verifyOtp = async (data: VerifyOtpDto) => {
    const user = await this.userRepo.findById(data.id);

    if (!user) throw new NotFoundError("User not found");

    if (user.otpExpiresAt && user.otpExpiresAt < new Date(Date.now()))
      throw new ForbiddenError("OTP has expired");

    if (!user.otp || user.otp !== data.otp)
      throw new ConflictError("Invalid OTP");

    const query: UpdateQuery<IUser> = {
      $set: { isOtpVerified: true },
      $unset: { otp: 1, otpExpiresAt: 1 },
    };

    await this.userRepo.update(String(user._id), query);

    return { message: "OTP verified successfully" };
  };

  resendOtp = async (email: string) => {
    const user = await this.userRepo.findByEmail(email);

    if (!user) throw new NotFoundError("User not found");

    if (user.isOtpVerified) throw new ConflictError("User already verified");

    const query: UpdateQuery<IUser> = {
      $set: {
        otp: this._generateOtp(),
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    };

    await this.userRepo.update(String(user._id), query);

    return { message: "OTP resent successfully" };
  };

  createPassword = async (data: CreatePasswordDto) => {
    const user = await this.userRepo.findById(data.id);

    if (!user) throw new NotFoundError("User not found");

    if (!user.isOtpVerified) throw new ConflictError("Email not verified");

    if (user.password) throw new ConflictError("Password already created");

    const hashedPassword = await this._hashPassword(data.password);

    const query: UpdateQuery<IUser> = {
      $set: { password: hashedPassword },
    };

    await this.userRepo.update(String(user._id), query);

    return { message: "Password created successfully" };
  };

  login = async (data: LoginDto) => {
    const user = await this.userRepo.findByEmail(data.email);

    if (!user) throw new NotFoundError("Invalid email or password");

    if (!user.isOtpVerified) throw new ConflictError("Email not verified");

    if (!user.password) throw new ConflictError("Password not created");

    if (!(await this._verifyPassword(data.password, user.password)))
      throw new NotFoundError("Invalid email or password");

    if (user.role !== data.role) throw new ConflictError("Invalid role");

    const token = this._generateToken(
      user._id.toString(),
      user.email,
      user.role,
    );

    const userObject = user.toObject();

    delete userObject.password;

    return {
      token,
      user: userObject,
    };
  };

  private _generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  private buildAuthResponse(user: IUser, message: string) {
    return {
      message,
      id: String(user._id),
      isOtpVerified: user.isOtpVerified,
      isProfileComplete: user.isProfileComplete,
      isPasswordCreated: !!user.password,
    };
  }

  private _hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
  };

  private _verifyPassword = async (
    password: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  };

  private _generateToken = (
    id: string,
    email: string,
    role: UserRole,
  ): string => {
    return jwt.sign({ id, email, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  };
}
