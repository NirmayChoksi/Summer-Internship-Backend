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
import { InstagramService } from "../../instagram/instagram.service.js";
import { InfluencerProfileRepository } from "../profile/influencerProfile.repository.js";
import { PublishMediaDto } from "./post.dto.js";
import { CaptionResult } from "./post.model.js";

export class PostService {
  private influencerProfileRepo = new InfluencerProfileRepository();
  private instagramService = new InstagramService();

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

  refineCaptionWithGemini = async (caption: string, instruction: string) => {
    const promptText = this._getRefineCaptionPrompt(caption, instruction);

    const response = await this.openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: promptText,
        },
      ],
      temperature: 0.8,
      top_p: 0.95,
    });

    const rawResponse = response.choices[0].message.content;

    if (!rawResponse) throw new InternalServerError("Failed to refine caption");

    const result = JSON.parse(rawResponse.replace(/```json\s*|\s*```/g, ""));

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

    try {
      const result = await this.instagramService.publishMedia(
        profile.instagram.token,
        profile.instagram.userId,
        {
          caption: data.caption,
          imageUrl: data.imageUrl
            ? `${env.BASE_URL}/${data.imageUrl}`
            : undefined,
          videoUrl: data.videoUrl
            ? `${env.BASE_URL}/${data.videoUrl}`
            : undefined,
        },
      );

      return {
        message: "Media uploaded successfully",
        mediaId: result.id,
      };
    } finally {
      if (data.imageUrl) await deleteFile(data.imageUrl);

      if (data.videoUrl) await deleteFile(data.videoUrl);
    }
  };

  private _getCaptionPrompt = (userText: string | undefined) => {
    const contextLine = userText
      ? `The user provided this context/idea for the post: "${userText}". Use this as guidance for tone, topic, or angle.`
      : `No additional context was provided — base the caption purely on what's visible in the image.`;

    return `
    You are a social media expert.

    Analyze the image and generate THREE different Instagram captions.

    Caption 1:
    - Professional
    - Brand-friendly
    - Clear and polished

    Caption 2:
    - Casual
    - Conversational
    - Human and relatable

    Caption 3:
    - Storytelling
    - More emotional
    - Creates engagement

    ${contextLine}

    Generate:
    - 3 unique captions
    - 10 hashtags
    - Tone label for each caption

    Return ONLY valid JSON:

    {
      "captions": [
        {
          "tone": "Professional",
          "caption": "..."
        },
        {
          "tone": "Casual",
          "caption": "..."
        },
        {
          "tone": "Storytelling",
          "caption": "..."
        }
      ],
      "hashtags": [
        "tag1",
        "tag2"
      ]
    }
    `;
  };

  private _getRefineCaptionPrompt = (caption: string, instruction: string) => {
    return `
    You are an expert social media copywriter.

    Current caption:
    "${caption}"

    User instruction:
    "${instruction}"

    Rewrite the caption according to the instruction.

    Keep the meaning unless the instruction explicitly asks otherwise.

    Vary your sentence structure and word choice from the original — do not just lightly tweak it.

    Return ONLY valid JSON:

    {
      "caption": "rewritten caption"
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
}
