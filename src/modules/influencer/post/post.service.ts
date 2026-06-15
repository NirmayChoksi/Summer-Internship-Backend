import { Types } from "mongoose";
import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import { env } from "../../../config/env.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../../shared/utils/appError.js";
import { deleteFile } from "../../../shared/utils/fileHelper.js";
import { InfluencerProfileRepository } from "../profile/influencerProfile.repository.js";
import { PublishMediaDto } from "./post.dto.js";
import { CaptionResult } from "./post.model.js";

export class PostService {
  private influencerProfileRepo = new InfluencerProfileRepository();

  private openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  generateCaptionWithGemini = async (
    userText: string | undefined,
    file?: Express.Multer.File,
  ) => {
    if (!file) throw new BadRequestError("Post image/video not uploaded");

    const promptText = this._getCaptionPrompt(userText);

    const fileBuffer = await readFile(file.path);

    const base64File = fileBuffer.toString("base64");

    const response = await this.openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "image_url",
              image_url: { url: `data:${file.mimetype};base64,${base64File}` },
            },
          ],
        },
      ],
      temperature: 0.9,
    });

    const rawResponse = response.choices[0].message.content;

    if (!rawResponse)
      throw new InternalServerError("Failed to generate caption!");

    const result = this._cleanAndParseJson(rawResponse);

    if (!result) throw new InternalServerError("Failed to generate caption!");

    await deleteFile(file.path);

    return result;
  };

  publishMedia = async (userId: string, data: PublishMediaDto) => {
    const profile = await this.influencerProfileRepo.findByUserId(
      new Types.ObjectId(userId),
      "+instagram.token +instagram.userId",
    );

    if (!profile) throw new NotFoundError("Influencer profile not found");

    if (!profile.instagram.token || !profile.instagram.userId)
      throw new BadRequestError("Instagram account not connected");

    const containerParams = new URLSearchParams({
      access_token: profile.instagram.token,
      caption: data.caption,
    });

    if (data.imageUrl) {
      containerParams.set("image_url", `${env.BASE_URL}/${data.imageUrl}`);
    } else if (data.videoUrl) {
      containerParams.set("video_url", `${env.BASE_URL}/${data.videoUrl}`);
      containerParams.set("media_type", "REELS");
    }

    const containerUrl = `https://graph.instagram.com/v24.0/${profile.instagram.userId}/media`;

    const containerResponse = await fetch(containerUrl, {
      method: "POST",
      body: containerParams,
    });
    const containerData = await containerResponse.json();

    if (!containerResponse.ok)
      throw new BadRequestError(
        containerData.error?.message ?? "Failed to create media container",
      );

    const creationId = containerData.id;

    if (!creationId) throw new BadRequestError("Failed to get media container");

    console.log("🚀 ~ data.videoUrl:", data.videoUrl);
    if (data.videoUrl)
      await this._waitForContainerReady(creationId, profile.instagram.token);

    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: profile.instagram.token,
    });

    const publishUrl = `https://graph.instagram.com/v24.0/${profile.instagram.userId}/media_publish`;

    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      body: publishParams,
    });
    const publishData = await publishResponse.json();

    if (!publishResponse.ok)
      throw new BadRequestError(
        publishData.error?.message ?? "Failed to publish media",
      );

    if (data.imageUrl) await deleteFile(data.imageUrl);
    else if (data.videoUrl) await deleteFile(data.videoUrl);

    return { message: "Media Uploaded Successfully" };
  };

  private _getCaptionPrompt = (userText: string | undefined) => {
    const contextLine = userText
      ? `The user provided this context/idea for the post: "${userText}". Use this as guidance for tone, topic, or angle.`
      : `No additional context was provided — base the caption purely on what's visible in the image.`;

    return `
  You are a social media expert who writes engaging Instagram captions.

  ANALYZE the image:
  - What is shown (subject, setting, mood, colors, activity)?
  - What story or feeling does it convey?

  ${contextLine}

  WRITE an Instagram caption that:
  ✓ Feels authentic and human, not generic or AI-sounding
  ✓ Matches the vibe of the image (and the user's context, if given)
  ✓ Is concise (1-3 sentences, optionally with line breaks)
  ✓ Can include relevant emojis if appropriate to the tone
  ✓ Avoids clichés like "living my best life" unless it truly fits

  ALSO generate:
  - 5-10 relevant hashtags (no # symbol needed, just the words)
  - A one-word/phrase description of the tone (e.g. "playful", "inspirational", "minimal")

  OUTPUT FORMAT - Return ONLY this JSON (no extra text):
  {
      "caption": "The full caption text",
      "hashtags": ["hashtag1", "hashtag2", "..."],
      "tone": "tone description"
  }
  `;
  };

  private _cleanAndParseJson = (responseText: string): CaptionResult | null => {
    const cleaned = responseText.replace(/```json\s*|\s*```/g, "").trim();
    try {
      return JSON.parse(cleaned) as CaptionResult;
    } catch (error) {
      console.error("JSON validation failed:", error);
      console.error("Problematic JSON string:", cleaned.substring(0, 200));
      return null;
    }
  };

  private _waitForContainerReady = async (
    creationId: string,
    accessToken: string,
    maxAttempts: number = 20,
    intervalMs: number = 3000,
  ) => {
    for (let i = 0; i < maxAttempts; i++) {
      const res = await fetch(
        `https://graph.instagram.com/v24.0/${creationId}?fields=status_code&access_token=${accessToken}`,
      );
      const data = await res.json();

      console.log("Container status:", data);

      if (data.status_code === "FINISHED") return;
      if (data.status_code === "ERROR") {
        throw new BadRequestError("Media processing failed");
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new BadRequestError("Media processing timed out");
  };
}
