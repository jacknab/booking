import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { db } from "./db";
import { googleBusinessProfiles, googleReviews, googleReviewResponses } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleReviewData {
  name: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  // New API uses "starRating" string enum; old API uses numeric "rating"
  starRating?: string; // "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE"
  rating?: number;
  comment?: string;
  reviewText?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
  publisherResponse?: {
    comment: string;
    updateTime: string;
  };
}

/** Convert "FIVE" / 5 to numeric 5 */
function normalizeStarRating(rating: string | number | undefined): number {
  if (typeof rating === "number") return Math.min(5, Math.max(1, rating));
  const map: Record<string, number> = {
    ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
  };
  return map[rating ?? ""] ?? 0;
}

export class GoogleBusinessAPIManager {
  private oauth2Client: OAuth2Client;

  constructor(config: GoogleAuthConfig) {
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Get the OAuth2 authorization URL for user consent.
   * state should be a random CSRF token stored in the session.
   */
  getAuthUrl(
    scopes: string[] = [
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    state?: string
  ): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",        // always show consent so we get a fresh refresh_token
      include_granted_scopes: true,
      state,
    });
  }

  /**
   * Exchange authorization code for tokens.
   * Automatically stores credentials on the internal OAuth2Client.
   */
  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  /**
   * Set stored credentials so subsequent calls auto-refresh the access token.
   */
  setCredentials(tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
  }) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Fetch the authenticated Google user's email / display name.
   * Required to store googleAccountEmail during the OAuth flow.
   */
  async getGoogleUserInfo(): Promise<{ email: string; name: string } | null> {
    try {
      const oauth2 = google.oauth2({ version: "v2", auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();
      return { email: data.email ?? "", name: data.name ?? "" };
    } catch (error) {
      console.error("Error fetching Google user info:", error);
      return null;
    }
  }

  /**
   * List Google Business accounts for the authenticated user.
   * Uses mybusinessaccountmanagement v1 with proper auth.
   */
  async getBusinessAccounts(): Promise<any> {
    console.log("[GBP] getBusinessAccounts — calling mybusinessaccountmanagement v1 accounts.list");
    // Pass the OAuth client directly into the API constructor
    const service = google.mybusinessaccountmanagement({
      version: "v1",
      auth: this.oauth2Client,
    });
    try {
      const response = await service.accounts.list({});
      const data = response.data;
      const accounts: any[] = data.accounts ?? [];
      console.log(`[GBP] getBusinessAccounts — raw response: ${JSON.stringify(data).slice(0, 500)}`);
      console.log(`[GBP] getBusinessAccounts — accounts found: ${accounts.length}`);
      accounts.forEach((a: any, i: number) => {
        console.log(`[GBP]   [${i}] name="${a.name}"  accountName="${a.accountName ?? "(none)"}"  type="${a.type ?? "(none)"}"  verificationState="${a.verificationState ?? "(none)"}"  vettedState="${a.vettedState ?? "(none)"}"`);
      });
      if (accounts.length === 0) {
        console.warn("[GBP] getBusinessAccounts — ZERO accounts returned. The authenticated Google account has no Business Profile. The user needs to create one at business.google.com.");
      }
      return data;
    } catch (error: any) {
      const status = error?.code ?? error?.response?.status ?? error?.status;
      const msg = error?.message ?? String(error);
      const responseBody = error?.response?.data ? JSON.stringify(error.response.data).slice(0, 400) : "(no body)";
      console.error(`[GBP] getBusinessAccounts FAILED — status: ${status}  message: ${msg}`);
      console.error(`[GBP] getBusinessAccounts FAILED — response body: ${responseBody}`);
      if (status === 403) {
        console.error("[GBP] 403: Ensure 'My Business Account Management API' is enabled in Google Cloud Console and the business.manage scope is on the OAuth consent screen.");
      }
      throw error;
    }
  }

  /**
   * List locations for a given business account.
   * Uses mybusinessbusinessinformation v1 with proper auth.
   */
  async getLocations(accountName: string): Promise<any> {
    console.log(`[GBP] getLocations — account: ${accountName}`);
    const service = google.mybusinessbusinessinformation({
      version: "v1",
      auth: this.oauth2Client,
    });
    try {
      const response = await service.accounts.locations.list({
        parent: accountName,
        // readMask is REQUIRED by mybusinessbusinessinformation v1
        // "title" is the human-readable business name
        readMask: "name,title,storeCode,storefrontAddress,phoneNumbers,websiteUri",
      } as any);
      const data = response.data;
      const locs: any[] = data.locations ?? [];
      console.log(`[GBP] getLocations — raw response: ${JSON.stringify(data).slice(0, 500)}`);
      console.log(`[GBP] getLocations — locations found: ${locs.length}`);
      locs.forEach((l: any, i: number) => {
        console.log(`[GBP]   [${i}] name="${l.name}"  title="${l.title ?? "(none)"}"  storeCode="${l.storeCode ?? "(none)"}"`);
        if (l.storefrontAddress) {
          console.log(`[GBP]       address: ${JSON.stringify(l.storefrontAddress)}`);
        }
      });
      if (locs.length === 0) {
        console.warn(`[GBP] getLocations — ZERO locations returned for account ${accountName}. The account may have no verified locations in Google Business Profile.`);
      }
      return data;
    } catch (error: any) {
      const status = error?.code ?? error?.response?.status ?? error?.status;
      const msg = error?.message ?? String(error);
      console.error(`[GBP] getLocations FAILED — status: ${status}  message: ${msg}`);
      if (status === 403) {
        console.error("[GBP] 403: Ensure 'Business Profile API' is enabled in Google Cloud Console and the business.manage scope is approved.");
      }
      if (status === 404) {
        console.error(`[GBP] 404: Account "${accountName}" not found or this token does not have access to it.`);
      }
      throw error;
    }
  }

  /**
   * Get reviews for a specific location.
   * Uses direct HTTP calls to mybusinessreviews.googleapis.com v1
   * because the googleapis npm package does not bundle this API.
   */
  async getReviews(locationName: string): Promise<GoogleReviewData[]> {
    console.log(`[GBP] getReviews — location: ${locationName}`);
    const url = `https://mybusinessreviews.googleapis.com/v1/${locationName}/reviews`;
    console.log(`[GBP] getReviews — URL: ${url}`);
    try {
      const response = await this.oauth2Client.request<{
        reviews?: GoogleReviewData[];
        totalReviewCount?: number;
        averageRating?: number;
        nextPageToken?: string;
      }>({
        url,
        method: "GET",
        params: { pageSize: 50 },
      });
      const reviews = response.data.reviews ?? [];
      console.log(`[GBP] getReviews — totalReviewCount from API: ${response.data.totalReviewCount ?? "(not returned)"}`);
      console.log(`[GBP] getReviews — averageRating from API: ${response.data.averageRating ?? "(not returned)"}`);
      console.log(`[GBP] getReviews — reviews in this page: ${reviews.length}`);
      if (reviews.length === 0) {
        console.warn(`[GBP] getReviews — ZERO reviews returned for location "${locationName}". This could mean the location has no reviews, or the API access does not include review data.`);
        console.warn(`[GBP] getReviews — raw response: ${JSON.stringify(response.data).slice(0, 300)}`);
      } else {
        reviews.slice(0, 3).forEach((r: any, i: number) => {
          console.log(`[GBP]   [${i}] reviewId="${r.name}"  rating="${r.starRating ?? r.rating}"  reviewer="${r.reviewer?.displayName ?? "(none)"}"`);
        });
      }
      return reviews;
    } catch (error: any) {
      const status = error?.code ?? error?.response?.status ?? error?.status;
      const msg = error?.message ?? String(error);
      const responseBody = error?.response?.data ? JSON.stringify(error.response.data).slice(0, 400) : "(no body)";
      console.error(`[GBP] getReviews FAILED — location: ${locationName}`);
      console.error(`[GBP] getReviews FAILED — status: ${status}  message: ${msg}`);
      console.error(`[GBP] getReviews FAILED — response body: ${responseBody}`);
      if (status === 403) {
        console.error("[GBP] 403 on reviews: The Business Profile API may not have reviews scope, or the location does not belong to this account.");
      }
      if (status === 404) {
        console.error(`[GBP] 404 on reviews: Location resource "${locationName}" not found. Verify the location name format is exactly as returned by getLocations (e.g. accounts/123/locations/456).`);
      }
      throw error;
    }
  }

  /**
   * Post or update a reply to a review.
   * PUT https://mybusinessreviews.googleapis.com/v1/{reviewName}/reply
   */
  async replyToReview(reviewName: string, comment: string): Promise<any> {
    try {
      const response = await this.oauth2Client.request({
        url: `https://mybusinessreviews.googleapis.com/v1/${reviewName}/reply`,
        method: "PUT",
        data: { comment },
      });
      return response.data;
    } catch (error) {
      console.error("Error replying to review:", error);
      throw error;
    }
  }

  /**
   * Delete an existing reply from a review.
   * DELETE https://mybusinessreviews.googleapis.com/v1/{reviewName}/reply
   */
  async deleteReviewReply(reviewName: string): Promise<any> {
    try {
      const response = await this.oauth2Client.request({
        url: `https://mybusinessreviews.googleapis.com/v1/${reviewName}/reply`,
        method: "DELETE",
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting review reply:", error);
      throw error;
    }
  }

  /**
   * Revoke the stored OAuth access token at Google.
   * Called when the user disconnects their Google Business Profile.
   * Errors are swallowed so local cleanup still proceeds.
   */
  async revokeTokens(): Promise<void> {
    try {
      const accessToken = this.oauth2Client.credentials.access_token;
      if (accessToken) {
        await this.oauth2Client.revokeToken(accessToken);
        console.log("Google OAuth token revoked successfully");
      }
    } catch (error) {
      // Non-fatal: token may already be expired or revoked
      console.warn("Could not revoke Google OAuth token:", error);
    }
  }
}

/**
 * Build an authenticated GoogleBusinessAPIManager from a stored profile row.
 * The OAuth2Client handles automatic token refresh transparently.
 */
export function createApiManagerFromProfile(profile: {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}): GoogleBusinessAPIManager {
  const manager = new GoogleBusinessAPIManager({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
  });
  manager.setCredentials({
    access_token: profile.accessToken,
    refresh_token: profile.refreshToken,
    expiry_date: profile.tokenExpiresAt?.getTime() ?? null,
  });
  return manager;
}

/**
 * Sync reviews from Google for a store and upsert into the local database.
 * Returns a summary of what was synced so callers can include it in API responses.
 */
export async function syncGoogleReviews(
  storeId: number,
  _legacyOAuth2Client?: OAuth2Client   // signature kept for backward compat
): Promise<{ synced: number; locationResourceName: string; businessName: string | null }> {
  console.log(`[GBP:sync] ── Starting sync for storeId=${storeId} ───────────────`);

  // Load the stored profile
  const profiles = await db
    .select()
    .from(googleBusinessProfiles)
    .where(eq(googleBusinessProfiles.storeId, storeId))
    .limit(1);

  if (!profiles.length) {
    const msg = `[GBP:sync] No Google Business Profile row found for storeId=${storeId}`;
    console.error(msg);
    throw new Error("Google Business Profile not connected for this store");
  }

  const googleProfile = profiles[0];
  console.log(`[GBP:sync] Profile found — id=${googleProfile.id}  isConnected=${googleProfile.isConnected}  businessName="${googleProfile.businessName ?? "(none)"}"  locationResourceName="${googleProfile.locationResourceName ?? "(none)"}"`);
  console.log(`[GBP:sync]   accessToken present: ${!!googleProfile.accessToken}  refreshToken present: ${!!googleProfile.refreshToken}`);
  console.log(`[GBP:sync]   tokenExpiresAt: ${googleProfile.tokenExpiresAt?.toISOString() ?? "(none)"}`);

  if (!googleProfile.locationResourceName) {
    const msg = `[GBP:sync] locationResourceName is NULL for storeId=${storeId}. User must complete location selection in the Google Business setup.`;
    console.error(msg);
    throw new Error("No location connected. Please reconnect your Google Business Profile and select a location.");
  }

  if (!googleProfile.accessToken) {
    const msg = `[GBP:sync] accessToken is NULL for storeId=${storeId}. Re-authentication required.`;
    console.error(msg);
    throw new Error("Google access token missing. Please reconnect your Google Business Profile.");
  }

  const apiManager = createApiManagerFromProfile(googleProfile);

  // Fetch reviews from the Google API
  console.log(`[GBP:sync] Calling getReviews for location: ${googleProfile.locationResourceName}`);
  const reviews = await apiManager.getReviews(googleProfile.locationResourceName);
  console.log(`[GBP:sync] getReviews returned ${reviews.length} review(s)`);

  // Upsert each review into the database
  let insertedCount = 0;
  let updatedCount = 0;

  for (const review of reviews) {
    const googleReviewId = review.name.split("/").pop() ?? review.name;
    const rating = normalizeStarRating((review as any).starRating ?? (review as any).rating);
    const reviewText = review.comment ?? (review as any).reviewText;
    const hasReply = !!(review.reviewReply ?? review.publisherResponse);

    console.log(`[GBP:sync]   review="${googleReviewId}"  rating=${rating}  reviewer="${review.reviewer?.displayName ?? "Anonymous"}"  hasReply=${hasReply}`);

    const existing = await db
      .select()
      .from(googleReviews)
      .where(eq(googleReviews.googleReviewId, googleReviewId))
      .limit(1);

    if (!existing.length) {
      await db.insert(googleReviews).values({
        storeId,
        googleReviewId,
        googleLocationId: googleProfile.locationId,
        customerName: review.reviewer?.displayName ?? "Anonymous",
        rating,
        reviewText,
        reviewImageUrls: JSON.stringify([]),
        reviewCreateTime: review.createTime ? new Date(review.createTime) : null,
        reviewUpdateTime: review.updateTime ? new Date(review.updateTime) : null,
        reviewerLanguageCode: "en",
        responseStatus: hasReply ? "responded" : "not_responded",
      });
      insertedCount++;
    } else {
      await db
        .update(googleReviews)
        .set({
          reviewText,
          responseStatus: hasReply ? "responded" : "not_responded",
          reviewUpdateTime: review.updateTime ? new Date(review.updateTime) : null,
          updatedAt: new Date(),
        })
        .where(eq(googleReviews.googleReviewId, googleReviewId));
      updatedCount++;
    }
  }

  // Record the last sync timestamp
  await db
    .update(googleBusinessProfiles)
    .set({ lastSyncedAt: new Date() })
    .where(eq(googleBusinessProfiles.id, googleProfile.id));

  console.log(`[GBP:sync] ── Sync complete for storeId=${storeId}: ${reviews.length} reviews (${insertedCount} new, ${updatedCount} updated) ──`);

  return {
    synced: reviews.length,
    locationResourceName: googleProfile.locationResourceName,
    businessName: googleProfile.businessName,
  };
}

/**
 * Publish an approved review response from the database to Google.
 */
export async function publishReviewResponse(
  responseId: number,
  _legacyOAuth2Client?: OAuth2Client   // signature kept for backward compat
): Promise<void> {
  // Load the draft response
  const responses = await db
    .select()
    .from(googleReviewResponses)
    .where(eq(googleReviewResponses.id, responseId))
    .limit(1);

  if (!responses.length) throw new Error("Review response not found");
  const reviewResponse = responses[0];

  // Load the associated review
  const reviewRecords = await db
    .select()
    .from(googleReviews)
    .where(eq(googleReviews.id, reviewResponse.googleReviewId))
    .limit(1);

  if (!reviewRecords.length) throw new Error("Review not found");
  const review = reviewRecords[0];

  // Load the store's Google Business Profile for tokens
  const profileData = await db
    .select()
    .from(googleBusinessProfiles)
    .where(eq(googleBusinessProfiles.storeId, review.storeId))
    .limit(1);

  if (!profileData.length) throw new Error("Google Business Profile not found");
  const googleProfile = profileData[0];

  const apiManager = createApiManagerFromProfile(googleProfile);

  // Post the reply via the Google API
  const reviewResourceName = `${googleProfile.locationResourceName}/reviews/${review.googleReviewId}`;
  await apiManager.replyToReview(reviewResourceName, reviewResponse.responseText);

  // Mark the response as published
  await db
    .update(googleReviewResponses)
    .set({ responseStatus: "approved", updatedAt: new Date() })
    .where(eq(googleReviewResponses.id, responseId));

  // Mark the review as responded
  await db
    .update(googleReviews)
    .set({ responseStatus: "responded" })
    .where(eq(googleReviews.id, review.id));

  console.log(`Published response for review ${review.googleReviewId}`);
}
