import { Types, UpdateQuery } from "mongoose";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../../shared/utils/appError.js";
import { removeUndefinedFields } from "../../../shared/utils/removeUndefinedFields.js";
import { InstagramService } from "../../instagram/instagram.service.js";
import { IUser } from "../../user/user.model.js";
import { UserRepository } from "../../user/user.repository.js";
import {
  CreateInfluencerProfileDto,
  UpdateInfluencerProfileDto,
} from "./influencerProfile.dto.js";
import { IInfluencerProfile } from "./influencerProfile.model.js";
import { InfluencerProfileRepository } from "./influencerProfile.repository.js";

export class InfluencerProfileService {
  private influencerProfileRepo = new InfluencerProfileRepository();
  private userRepo = new UserRepository();
  private instagramService = new InstagramService();

  createInfluencerProfile = async (
    userId: string,
    data: CreateInfluencerProfileDto,
  ) => {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User not found");

    if (user.isProfileComplete)
      throw new ConflictError("Profile already completed");

    const existingProfile = await this.influencerProfileRepo.findByUserId(
      new Types.ObjectId(userId),
    );

    if (existingProfile) throw new ConflictError("Profile already exists");

    const profileData = {
      user: new Types.ObjectId(userId),
      ...data,
    };

    const influencerProfile =
      await this.influencerProfileRepo.create(profileData);

    const query: UpdateQuery<IUser> = {
      $set: { isProfileComplete: true },
    };

    await this.userRepo.update(userId, query);

    return {
      message: "Influencer profile created successfully",
      profile: influencerProfile,
    };
  };

  getInfluencerProfileById = async (profileId: string) => {
    const profile = await this._getInfluencerProfile(profileId);

    return {
      message: "Influencer profile fetched successfully",
      profile,
    };
  };

  getInfluencerProfileByUserId = async (userId: string) => {
    const profile = await this.influencerProfileRepo.findByUserId(
      new Types.ObjectId(userId),
    );

    if (!profile) throw new NotFoundError("Influencer profile not found");

    return {
      message: "Influencer profile fetched successfully",
      profile,
    };
  };

  async refreshInstagramFollowers(userId: string) {
    const profile =
      await this.influencerProfileRepo.findByUserIdWithInstagramToken(
        new Types.ObjectId(userId),
      );

    if (!profile) throw new NotFoundError("Influencer profile not found");

    if (!profile.instagram.token)
      throw new BadRequestError("Instagram account not connected");

    const { followers } = await this.instagramService.getLatestStats(
      profile.instagram.token,
    );

    const query: UpdateQuery<IInfluencerProfile> = {
      $set: { "instagram.followers": followers },
    };

    const updatedProfile = await this.influencerProfileRepo.update(
      profile.id,
      query,
    );

    if (!updatedProfile)
      throw new NotFoundError("Influencer profile not found");

    return {
      followers,
    };
  }

  updateInfluencerProfile = async (
    profileId: string,
    data: UpdateInfluencerProfileDto,
  ) => {
    const existingProfile = await this._getInfluencerProfile(profileId);

    const updateData = removeUndefinedFields(data);

    const updatedProfile = await this.influencerProfileRepo.update(profileId, {
      $set: updateData,
    });

    return {
      message: "Influencer profile updated successfully",
      profile: updatedProfile,
    };
  };

  private _getInfluencerProfile = async (profileId: string) => {
    const profile = await this.influencerProfileRepo.findById(profileId);

    if (!profile) throw new NotFoundError("Influencer profile not found");

    return profile;
  };
}
