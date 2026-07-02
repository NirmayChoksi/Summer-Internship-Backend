import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UpdateQuery } from "mongoose";
import { env } from "../../config/env.js";
import { emailService } from "../../shared/services/email.services.js";
import { otpTemplate } from "../../shared/templates/otp.template.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
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

    const { otp, otpExpiresAt } = this._generateOtpData();

    await emailService.sendMail({
      to: data.email,
      subject: "Verify your email",
      html: otpTemplate(data.email, otp),
    });

    if (existingUser) {
      const query: UpdateQuery<IUser> = {
        $set: { otp, otpExpiresAt },
      };

      const updatedUser = await this.userRepo.update(
        String(existingUser._id),
        query,
      );

      return this._buildAuthResponse(
        updatedUser!,
        "If account exists, OTP has been sent",
      );
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
    const user = await this._getUserById(data.id);

    this._assertOtpValid(user, data.otp);

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

    const { otp, otpExpiresAt } = this._generateOtpData();

    await emailService.sendMail({
      to: email,
      subject: "Verify your email",
      html: otpTemplate(email, otp, true),
    });

    const query: UpdateQuery<IUser> = {
      $set: { otp, otpExpiresAt },
    };

    await this.userRepo.update(String(user._id), query);

    return { message: "OTP resent successfully" };
  };

  createPassword = async (data: CreatePasswordDto) => {
    const user = await this._getUserById(data.id);

    if (!user.isOtpVerified) throw new ForbiddenError("Email not verified");

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

    if (!user) throw new UnauthorizedError("Invalid email or password");

    this._assertUserCanLogin(user, data.role);

    const isPasswordValid = await this._verifyPassword(
      data.password,
      user.password!,
    );

    if (!isPasswordValid)
      throw new UnauthorizedError("Invalid email or password");

    const token = this._generateToken(
      user._id.toString(),
      user.email,
      user.role,
    );

    return {
      token,
      user: this._sanitizeUser(user),
    };
  };

  private _assertOtpValid = (user: IUser, otp: string) => {
    if (!user.otp || !user.otpExpiresAt)
      throw new UnauthorizedError("Invalid OTP");

    if (user.otpExpiresAt && user.otpExpiresAt < new Date())
      throw new BadRequestError("OTP has expired");

    if (!user.otp || user.otp !== otp)
      throw new UnauthorizedError("Invalid OTP");
  };

  private _assertUserCanLogin = (user: IUser, role: UserRole) => {
    if (!user.isOtpVerified) throw new ForbiddenError("Email not verified");

    if (!user.password) throw new ForbiddenError("Password not created");

    if (user.role !== role) throw new UnauthorizedError("Invalid role");
  };

  private _buildAuthResponse = (user: IUser, message: string) => {
    return {
      message,
      id: String(user._id),
      isOtpVerified: user.isOtpVerified,
      isProfileComplete: user.isProfileComplete,
      isPasswordCreated: !!user.password,
    };
  };

  private _generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  private _generateOtpData = () => {
    return {
      otp: this._generateOtp(),
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
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

  private _getUserById = async (id: string) => {
    const user = await this.userRepo.findById(id);

    if (!user) throw new NotFoundError("User not found");

    return user;
  };

  private _hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
  };

  private _sanitizeUser = (user: IUser) => {
    const userObject = user.toObject();

    delete userObject.password;

    return userObject;
  };

  private _verifyPassword = async (
    password: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  };
}
