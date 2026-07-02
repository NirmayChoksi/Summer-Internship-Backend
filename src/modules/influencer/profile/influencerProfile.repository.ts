import { Types, UpdateQuery } from "mongoose";
import {
  IInfluencerProfile,
  InfluencerProfile,
} from "./influencerProfile.model.js";

export class InfluencerProfileRepository {
  create = async (data: Partial<IInfluencerProfile>) => {
    return await InfluencerProfile.create(data);
  };

  findById = async (id: string, populateUser?: boolean) => {
    let query = InfluencerProfile.findById(id);

    if (populateUser) query.populate("user");
    return await query;
  };

  findByUserId = async (userId: Types.ObjectId, select?: string) => {
    return await InfluencerProfile.findOne({
      user: userId,
    }).select(select ?? "");
  };

  findByEmail = async (email: string) => {
    return await InfluencerProfile.findOne({
      email,
    });
  };

  update = async (id: string, query: UpdateQuery<IInfluencerProfile>) => {
    return await InfluencerProfile.findByIdAndUpdate(id, query, {
      returnDocument: "after",
    });
  };

  delete = async (id: string) => {
    return await InfluencerProfile.findByIdAndDelete(id);
  };
}
