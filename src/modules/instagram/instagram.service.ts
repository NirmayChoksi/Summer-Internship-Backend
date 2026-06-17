import { env } from "../../config/env.js";
import { BadRequestError } from "../../shared/utils/appError.js";

export class InstagramService {
  exchange = async (code: string) => {
    const params = new URLSearchParams({
      client_id: env.INSTAGRAM_APP_ID,
      client_secret: env.INSTAGRAM_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: env.INSTAGRAM_REDIRECT_URI,
      code,
    });

    const shortTokenRes = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        body: params,
      },
    );

    const shortTokenData = await shortTokenRes.json();
    if (!shortTokenRes.ok)
      throw new BadRequestError(
        shortTokenData.error?.message ?? "Instagram token exchange failed",
      );

    const { access_token: shortLivedToken } = shortTokenData;

    const longTokenUrl =
      `https://graph.instagram.com/access_token` +
      `?grant_type=ig_exchange_token` +
      `&client_secret=${env.INSTAGRAM_APP_SECRET}` +
      `&access_token=${shortLivedToken}`;

    const longTokenRes = await fetch(longTokenUrl);
    const longTokenData = await longTokenRes.json();
    const longLivedToken = longTokenData.access_token;

    if (!longTokenData.access_token)
      throw new BadRequestError("Instagram did not return a long-lived token");

    const profileUrl =
      `https://graph.instagram.com/v24.0/me` +
      `?fields=user_id,username,account_type,media_count,followers_count` +
      `&access_token=${longLivedToken}`;

    const profileRes = await fetch(profileUrl);
    const profile = await profileRes.json();

    if (!profile.username)
      throw new BadRequestError("Unable to fetch Instagram profile");

    return {
      profile: {
        id: profile.user_id,
        username: profile.username,
        followers: profile.followers_count,
        mediaCount: profile.media_count,
      },
      token: longLivedToken,
    };
  };

  getLatestStats = async (token: string) => {
    const url =
      `https://graph.instagram.com/v24.0/me` +
      `?fields=username,followers_count,media_count` +
      `&access_token=${token}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok)
      throw new BadRequestError(
        data.error?.message ?? "Failed to fetch Instagram stats",
      );

    return {
      username: data.username,
      followers: data.followers_count ?? 0,
    };
  };

  getMedia = async (
    token: string,
    options?: { after?: string; limit?: number },
  ) => {
    const params = new URLSearchParams({
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
      access_token: token,
      limit: String(options?.limit ?? 25),
    });

    if (options?.after) params.append("after", options.after);

    const response = await fetch(
      `https://graph.instagram.com/me/media?${params}`,
    );

    const data = await response.json();

    if (!response.ok)
      throw new BadRequestError(
        data.error?.message ?? "Failed to fetch Instagram media",
      );

    return {
      media: data.data,
      nextCursor: data.paging?.cursors?.after,
      hasNextPage: Boolean(data.paging?.next),
    };
  };

  publishMedia = async (
    accessToken: string,
    instagramUserId: string,
    data: { caption: string; imageUrl?: string; videoUrl?: string },
  ) => {
    const containerId = await this._createMediaContainer(
      accessToken,
      instagramUserId,
      data,
    );

    if (data.videoUrl)
      await this._waitForContainerReady(containerId, accessToken);

    const publishParams = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    });

    const response = await fetch(
      `https://graph.instagram.com/v24.0/${instagramUserId}/media_publish`,
      {
        method: "POST",
        body: publishParams,
      },
    );

    const publishData = await response.json();
    console.log("🚀 ~ publishData:", publishData);

    if (!response.ok)
      throw new BadRequestError(
        publishData.error?.message ?? "Failed to publish media",
      );

    return publishData;
  };

  private _createMediaContainer = async (
    accessToken: string,
    instagramUserId: string,
    data: {
      caption: string;
      imageUrl?: string;
      videoUrl?: string;
    },
  ) => {
    const params = new URLSearchParams({
      access_token: accessToken,
      caption: data.caption,
    });

    if (data.imageUrl) params.set("image_url", data.imageUrl);

    if (data.videoUrl) {
      params.set("video_url", data.videoUrl);
      params.set("media_type", "REELS");
    }

    const response = await fetch(
      `https://graph.instagram.com/v24.0/${instagramUserId}/media`,
      {
        method: "POST",
        body: params,
      },
    );

    const containerData = await response.json();

    if (!response.ok)
      throw new BadRequestError(
        containerData.error?.message ?? "Failed to create media container",
      );

    if (!containerData.id)
      throw new BadRequestError("Failed to get media container id");

    console.log("🚀 ~ containerData:", containerData);

    return containerData.id;
  };

  private _waitForContainerReady = async (
    creationId: string,
    accessToken: string,
    maxAttempts = 20,
    intervalMs = 3000,
  ) => {
    console.log("🚀 ~ creationId:", creationId);
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(
        `https://graph.instagram.com/v24.0/${creationId}` +
          `?fields=status_code,status` +
          `&access_token=${accessToken}`,
      );

      const data = await response.json();

      if (data.status_code === "FINISHED") return;

      if (data.status_code === "ERROR")
        throw new BadRequestError(data.status ?? "Media processing failed");

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new BadRequestError("Media processing timed out");
  };
}
