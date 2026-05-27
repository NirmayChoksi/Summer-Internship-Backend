import { Types, UpdateQuery } from "mongoose";
import { BrandProfile, IBrandProfile } from "./brandProfile.model.js";

export class BrandProfileRepository {
  create = async (data: Partial<IBrandProfile>) => {
    return await BrandProfile.create(data);
  };

  findById = async (id: string) => {
    return await BrandProfile.findById(id);
  };

  findByUserId = async (userId: Types.ObjectId) => {
    return await BrandProfile.findOne({
      user: userId,
    });
  };

  findByEmail = async (email: string) => {
    return await BrandProfile.findOne({
      email,
    });
  };

  update = async (id: string, query: UpdateQuery<IBrandProfile>) => {
    return await BrandProfile.findByIdAndUpdate(id, query, {
      returnDocument: "after",
    });
  };

  delete = async (id: string) => {
    return await BrandProfile.findByIdAndDelete(id);
  };
}
