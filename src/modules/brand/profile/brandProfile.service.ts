import { Types, UpdateQuery } from "mongoose";
import { emailService } from "../../../shared/services/email.services.js";
import { profileCompletedTemplate } from "../../../shared/templates/profile-completed.template.js";
import {
  ConflictError,
  NotFoundError,
} from "../../../shared/utils/appError.js";
import { deleteFile } from "../../../shared/utils/fileHelper.js";
import { removeUndefinedFields } from "../../../shared/utils/removeUndefinedFields.js";
import { IUser, UserRole } from "../../user/user.model.js";
import { UserRepository } from "../../user/user.repository.js";
import {
  CreateBrandProfileDto,
  UpdateBrandProfileDto,
} from "./brandProfile.dto.js";
import { IBrandProfile } from "./brandProfile.model.js";
import { BrandProfileRepository } from "./brandProfile.repository.js";

export class BrandProfileService {
  private brandProfileRepo = new BrandProfileRepository();
  private userRepo = new UserRepository();

  createBrandProfile = async (userId: string, data: CreateBrandProfileDto) => {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User not found");

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

    await emailService.sendMail({
      to: user.email,
      subject: "Your Brand Profile is Ready!",
      html: profileCompletedTemplate(brandProfile.companyName, UserRole.Brand),
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
    const profile = await this._getBrandProfile(profileId);

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
    const existingProfile = await this._getBrandProfile(profileId);

    if (data.companyLogo && data.companyLogo !== existingProfile.companyLogo)
      await deleteFile(existingProfile.companyLogo);

    const updateData = removeUndefinedFields(data);

    const query: UpdateQuery<IBrandProfile> = {
      $set: updateData,
    };

    const updatedProfile = await this.brandProfileRepo.update(profileId, query);

    return {
      message: "Brand profile updated successfully",
      profile: updatedProfile,
    };
  };

  private _getBrandProfile = async (profileId: string) => {
    const profile = await this.brandProfileRepo.findById(profileId);

    if (!profile) throw new NotFoundError("Brand profile not found");

    return profile;
  };
}
