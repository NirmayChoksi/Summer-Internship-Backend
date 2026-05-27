import { Types, UpdateQuery } from "mongoose";
import {
  ConflictError,
  NotFoundError,
} from "../../../shared/utils/appError.js";
import { deleteFile } from "../../../shared/utils/fileHelper.js";
import { IUser, UserRole } from "../../user/user.model.js";
import { UserRepository } from "../../user/user.repository.js";
import {
  CreateBrandProfileDto,
  UpdateBrandProfileDto,
} from "./brandProfile.dto.js";
import { BrandProfileRepository } from "./brandProfile.repository.js";

export class BrandProfileService {
  private userRepo = new UserRepository();

  private brandProfileRepo = new BrandProfileRepository();

  createBrandProfile = async (userId: string, data: CreateBrandProfileDto) => {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User not found");

    if (user.role !== UserRole.Brand)
      throw new ConflictError("User is not a brand");

    if (user.isProfileComplete)
      throw new ConflictError("Profile already completed");

    const existingProfile = await this.brandProfileRepo.findByUserId(
      new Types.ObjectId(userId),
    );

    if (existingProfile) throw new ConflictError("Profile already exists");

    const brandProfile = await this.brandProfileRepo.create({
      user: new Types.ObjectId(userId),
      ...data,
    });

    const query: UpdateQuery<IUser> = {
      $set: { isProfileComplete: true },
    };

    await this.userRepo.update(userId, query);

    return {
      message: "Brand profile created successfully",
      profile: brandProfile,
    };
  };

  getBrandProfileById = async (profileId: string) => {
    const profile = await this.brandProfileRepo.findById(profileId);

    if (!profile) throw new NotFoundError("Brand profile not found");

    return {
      message: "Brand profile fetched successfully",
      profile,
    };
  };

  getBrandProfileByUserId = async (userId: string) => {
    const profile = await this.brandProfileRepo.findByUserId(
      new Types.ObjectId(userId),
    );

    if (!profile) throw new NotFoundError("Brand profile not found");

    return {
      message: "Brand profile fetched successfully",
      profile,
    };
  };

  updateBrandProfile = async (
    profileId: string,
    data: UpdateBrandProfileDto,
  ) => {
    const existingProfile = await this.brandProfileRepo.findById(profileId);

    if (!existingProfile) throw new NotFoundError("Brand profile not found");

    if (data.companyLogo && data.companyLogo !== existingProfile.companyLogo)
      await deleteFile(existingProfile.companyLogo);

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    const updatedProfile = await this.brandProfileRepo.update(profileId, {
      $set: updateData,
    });

    return {
      message: "Brand profile updated successfully",
      profile: updatedProfile,
    };
  };
}
