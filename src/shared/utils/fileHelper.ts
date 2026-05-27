import fs from "fs/promises";
import path from "path";
import { logger } from "./logger.js";

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(path.resolve(filePath));
  } catch (err) {
    logger.warn(`Could not delete file: ${filePath}`, err);
  }
}
