import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { promisify } from "util";
import { logger } from "./logger.js";

const execFileAsync = promisify(execFile);

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(path.resolve(filePath));
  } catch (err) {
    logger.warn(`Could not delete file: ${filePath}`, err);
  }
}

export async function generateThumbnail(originalPath: string): Promise<string> {
  const ext = path.extname(originalPath);

  const filename = path.basename(originalPath, ext);

  const thumbnailDir = path.resolve("uploads/catalogues/thumbnails");

  await fs.mkdir(thumbnailDir, {
    recursive: true,
  });

  const thumbnailPath = path.join(thumbnailDir, `${filename}.webp`);

  await sharp(path.resolve(originalPath))
    .resize({
      width: 400,
      height: 600,
      fit: "cover",
    })
    .webp({
      quality: 80,
    })
    .toFile(thumbnailPath);

  return path.relative(process.cwd(), thumbnailPath);
}

export const generateVideoThumbnail = async (
  videoPath: string,
): Promise<string> => {
  const filename = path.parse(videoPath).name;

  const thumbnailDir = path.resolve("uploads/catalogues/thumbnails");

  await fs.mkdir(thumbnailDir, {
    recursive: true,
  });

  const thumbnailPath = path.join(thumbnailDir, `${filename}.jpg`);

  await execFileAsync("ffmpeg", [
    "-i",
    videoPath,
    "-ss",
    "00:00:01",
    "-vframes",
    "1",
    "-vf",
    "scale=400:600:force_original_aspect_ratio=increase,crop=400:600",
    thumbnailPath,
    "-y",
  ]);

  return path.relative(process.cwd(), thumbnailPath);
};

export const generateCatalogueThumbnail = async (
  filePath: string,
  mimeType: string,
) => {
  if (mimeType.startsWith("image/")) {
    return generateThumbnail(filePath);
  }

  if (mimeType.startsWith("video/")) {
    return generateVideoThumbnail(filePath);
  }

  return undefined;
};
