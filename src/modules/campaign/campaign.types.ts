export interface Caption {
  tone: string;
  caption: string;
}

export interface CaptionResult {
  captions: Caption[];
  hashtags: string[];
}

export interface RefinedCaption {
  caption: string;
}
