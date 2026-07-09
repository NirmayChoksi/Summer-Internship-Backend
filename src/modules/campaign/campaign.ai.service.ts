import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import { InternalServerError } from "../../shared/utils/appError.js";
import { deleteFile } from "../../shared/utils/fileHelper.js";
import { CaptionResult } from "./campaign.types.js";

export class CampaignAIService {
  private openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  generateCaption = async (
    userText: string | undefined,
    file: Express.Multer.File,
  ): Promise<CaptionResult> => {
    const prompt = this._getCaptionPrompt(userText);

    const fileBuffer = await readFile(file.path);

    const base64 = fileBuffer.toString("base64");

    try {
      const response = await this.openai.chat.completions.create({
        model: "gemini-2.5-flash",
        temperature: 0.9,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.mimetype};base64,${base64}`,
                },
              },
            ],
          },
        ],
      });

      const raw = response.choices[0].message.content;

      if (!raw) throw new InternalServerError("Failed to generate caption");

      const result = this._cleanAndParseJson(raw);

      if (!result) throw new InternalServerError("Failed to parse AI response");

      return result;
    } finally {
      await deleteFile(file.path);
    }
  };

  refineCaption = async (caption: string, instruction: string) => {
    const prompt = this._getRefinePrompt(caption, instruction);

    const response = await this.openai.chat.completions.create({
      model: "gemini-2.5-flash",
      temperature: 0.8,
      top_p: 0.95,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = response.choices[0].message.content;

    if (!raw) throw new InternalServerError("Failed to refine caption");

    return JSON.parse(raw.replace(/```json\s*|\s*```/g, ""));
  };

  private _getCaptionPrompt = (userText?: string) => {
    const context = userText
      ? `The user provided this context: "${userText}". Use it when generating captions.`
      : "No additional context was provided. Generate captions from the uploaded image only.";

    return `
You are a professional social media copywriter.

Analyze the uploaded image.

${context}

Generate:

- Three different Instagram captions.

Caption 1
- Professional
- Brand friendly

Caption 2
- Casual
- Human

Caption 3
- Storytelling
- Emotional

Also generate exactly 10 hashtags.

Return ONLY valid JSON.

{
  "captions":[
    {
      "tone":"Professional",
      "caption":"..."
    },
    {
      "tone":"Casual",
      "caption":"..."
    },
    {
      "tone":"Storytelling",
      "caption":"..."
    }
  ],
  "hashtags":[
    "...",
    "..."
  ]
}
`;
  };

  private _getRefinePrompt = (caption: string, instruction: string) => `
You are an expert social media copywriter.

Current caption:

"${caption}"

User instruction:

"${instruction}"

Rewrite the caption according to the instruction.

Keep the meaning unless instructed otherwise.

Return ONLY valid JSON.

{
    "caption":"..."
}
`;

  private _cleanAndParseJson(response: string): CaptionResult | null {
    try {
      return JSON.parse(response.replace(/```json\s*|\s*```/g, "").trim());
    } catch {
      return null;
    }
  }
}
