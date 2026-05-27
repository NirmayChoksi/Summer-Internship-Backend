import mongoose, { Document, Schema } from "mongoose";

export enum UserRole {
  Admin = "ADMIN",
  Brand = "BRAND",
  Influencer = "INFLUENCER",
}

export interface IUser extends Document {
  email: string;
  isOtpVerified: boolean;
  isProfileComplete: boolean;
  role: UserRole;
  otp?: string;
  otpExpiresAt?: Date;
  password?: string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },

    otp: {
      type: String,
    },

    otpExpiresAt: {
      type: Date,
    },

    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
