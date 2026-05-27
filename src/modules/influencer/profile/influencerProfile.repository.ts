import { Types, UpdateQuery } from "mongoose";
import {
  InfluencerProfile,
  IInfluencerProfile,
} from "./influencerProfile.model.js";

export class InfluencerProfileRepository {
  create = async (data: Partial<IInfluencerProfile>) => {
    return await InfluencerProfile.create(data);
  };

  findById = async (id: string) => {
    return await InfluencerProfile.findById(id);
  };

  findByUserId = async (userId: Types.ObjectId) => {
    return await InfluencerProfile.findOne({
      user: userId,
    });
  };

  findByEmail = async (email: string) => {
    return await InfluencerProfile.findOne({
      email,
    });
  };

  update = async (id: string, query: UpdateQuery<IInfluencerProfile>) => {
    return await InfluencerProfile.findByIdAndUpdate(id, query, {
      returnDocument:'after'
    });
  };

  delete = async (id: string) => {
    return await InfluencerProfile.findByIdAndDelete(id);
  };
}
