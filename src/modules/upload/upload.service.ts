import { BadRequestError } from "../../shared/utils/appError.js";

export class UploadService {
  uploadCompanyLogo = async (file?: Express.Multer.File) => {
    if (!file) throw new BadRequestError("Company logo not uploaded");

    return {
      url: `uploads/companyLogos/${file.filename}`,
    };
  };

  uploadPost = async (file?: Express.Multer.File) => {
    if (!file) throw new BadRequestError("Company logo not uploaded");

    return {
      url: `uploads/posts/${file.filename}`,
    };
  };
}
