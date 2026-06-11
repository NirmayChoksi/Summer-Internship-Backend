import { Types } from "mongoose";
import { Catalogue, ICatalogue } from "./catalogue.model.js";

export class CatalogueRepository {
  create = async (data: Partial<ICatalogue>) => {
    return await Catalogue.create(data);
  };

  createMany = async (data: Partial<ICatalogue>[]) => {
    return await Catalogue.insertMany(data);
  };

  find = async () => {
    return await Catalogue.find();
  };

  findById = async (id: string) => {
    return await Catalogue.findById(id);
  };

  findManyByIds = async (ids: Types.ObjectId[]) => {
    return await Catalogue.find({
      _id: { $in: ids },
    });
  };

  findByProfileId = async (profileId: Types.ObjectId) => {
    return await Catalogue.find({
      profile: profileId,
    }).sort({ createdAt: -1 });
  };

  delete = async (id: string) => {
    return await Catalogue.findByIdAndDelete(id);
  };

  deleteMany = async (ids: Types.ObjectId[]) => {
    return await Catalogue.deleteMany({
      _id: { $in: ids },
    });
  };
}
