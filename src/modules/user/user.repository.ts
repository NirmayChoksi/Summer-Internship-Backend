import { UpdateQuery } from "mongoose";
import { IUser, User } from "./user.model.js";

export class UserRepository {
  create = async (data: Partial<IUser>) => {
    return await User.create(data);
  };

  findByEmail = async (email: string) => {
    return await User.findOne({ email });
  };

  findById = async (id: string) => {
    return await User.findById(id);
  };

  update = async (id: string, query: UpdateQuery<IUser>) => {
    return await User.findByIdAndUpdate(id, query, {
      returnDocument:'after'
    });
  };
}
