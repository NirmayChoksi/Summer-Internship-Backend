import { Types } from "mongoose";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError
} from "../../../shared/utils/appError.js";
import {
  deleteFile,
  generateCatalogueThumbnail,
} from "../../../shared/utils/fileHelper.js";
import { InstagramService } from "../../instagram/instagram.service.js";
import { InfluencerProfileRepository } from "../profile/influencerProfile.repository.js";
import { ICatalogue } from "./catalogue.model.js";
import { CatalogueRepository } from "./catalogue.repository.js";

export class CatalogueService {
  private catalogueRepo = new CatalogueRepository();
  private influencerProfileRepo = new InfluencerProfileRepository();
  private instagramService = new InstagramService();

  createMany = async (userId: string, files: Express.Multer.File[]) => {
    const influencerProfile = await this._getInfluencerProfileByUserId(userId);

    const catalogues = await Promise.all(
      files.map(async (file) => {
        const thumbnailPath = await generateCatalogueThumbnail(
          file.path,
          file.mimetype,
        );

        return {
          profile: influencerProfile._id,
          path: file.path,
          thumbnailPath,
          name: file.originalname,
          type: file.mimetype,
        };
      }),
    );

    const createdCatalogues = await this.catalogueRepo.createMany(catalogues);

    return {
      message: "Catalogue uploaded successfully",
      catalogues: createdCatalogues,
    };
  };

  getMyCatalogue = async (userId: string) => {
    const influencerProfile = await this._getInfluencerProfileByUserId(userId);

    const catalogues = await this.catalogueRepo.findByProfileId(
      influencerProfile._id,
    );

    return {
      message: "Catalogues fetched successfully",
      catalogues,
    };
  };

  async getInstagramMedia(
    userId: string,
    options?: {
      after?: string;
      limit?: number;
    },
  ) {
    const profile =
      await this.influencerProfileRepo.findByUserIdWithInstagramToken(
        new Types.ObjectId(userId),
      );

    if (!profile) throw new NotFoundError("Influencer profile not found");

    if (!profile.instagram.token)
      throw new BadRequestError("Instagram account not connected");

    const result = await this.instagramService.getMedia(
      profile.instagram.token,
      options,
    );

    return {
      media: result.media.map((item: any) => ({
        id: item.id,
        type: item.media_type,
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url,
        caption: item.caption,
        permalink: item.permalink,
        createdAt: item.timestamp,
      })),
      pagination: {
        nextCursor: result.nextCursor,
        hasNextPage: result.hasNextPage,
      },
    };
  }

  deleteCatalogue = async (catalogueId: string, userId: string) => {
    const catalogue = await this.catalogueRepo.findById(catalogueId);

    if (!catalogue) throw new NotFoundError("Catalogue not found");

    const influencerProfile = await this._getInfluencerProfileByUserId(userId);

    this._assertCatalogueOwnership(catalogue, influencerProfile._id);

    await deleteFile(catalogue.path);

    await this.catalogueRepo.delete(catalogueId);

    return {
      message: "Catalogue deleted successfully",
    };
  };

  deleteMany = async (catalogueIds: string[], userId: string) => {
    const influencerProfile = await this._getInfluencerProfileByUserId(userId);

    const objectIds = catalogueIds.map((id) => new Types.ObjectId(id));

    const catalogues = await this.catalogueRepo.findManyByIds(objectIds);

    catalogues.forEach((catalogue) =>
      this._assertCatalogueOwnership(catalogue, influencerProfile._id),
    );

    await Promise.all(
      catalogues.map((catalogue) => deleteFile(catalogue.path)),
    );

    await this.catalogueRepo.deleteMany(objectIds);

    return {
      message: "Catalogues deleted successfully",
    };
  };

  private _assertCatalogueOwnership = (
    catalogue: ICatalogue,
    profileId: Types.ObjectId,
  ) => {
    if (String(catalogue.profile) !== String(profileId))
      throw new ForbiddenError(
        "You do not have permission to access this catalogue",
      );
  };

  private _getInfluencerProfileByUserId = async (userId: string) => {
    const influencerProfile = await this.influencerProfileRepo.findByUserId(
      new Types.ObjectId(userId),
    );

    if (!influencerProfile)
      throw new NotFoundError("Influencer profile not found");

    return influencerProfile;
  };
}
