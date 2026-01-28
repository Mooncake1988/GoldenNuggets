import { storage } from "./storage";
import type { Location } from "@shared/schema";

const APIFY_API_TOKEN = process.env.APIFY_API_KEY;
const APIFY_ACTOR_ID = "apify~instagram-hashtag-scraper";

interface ApifyHashtagResult {
  tagName: string;
  postsCount: number;
}

export function calculateTrendingScore(currentCount: number, previousCount: number): number {
  if (previousCount === 0) {
    return currentCount > 0 ? 100 : 0;
  }
  return ((currentCount - previousCount) / previousCount) * 100;
}

export async function fetchHashtagPostCount(hashtag: string): Promise<number | null> {
  if (!APIFY_API_TOKEN) {
    console.error("[SocialTrends] APIFY_API_KEY not configured");
    return null;
  }

  const cleanHashtag = hashtag.replace(/^#/, "").toLowerCase();

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hashtags: [cleanHashtag],
          resultsLimit: 1,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SocialTrends] Apify API error for #${cleanHashtag}:`, response.status, errorText);
      return null;
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      if (result.postsCount !== undefined) {
        return result.postsCount;
      }
      if (result.edge_hashtag_to_media?.count !== undefined) {
        return result.edge_hashtag_to_media.count;
      }
    }

    console.warn(`[SocialTrends] No post count found for #${cleanHashtag}`);
    return null;
  } catch (error) {
    console.error(`[SocialTrends] Failed to fetch hashtag data for #${cleanHashtag}:`, error);
    return null;
  }
}

export async function updateAllSocialTrends(): Promise<{
  success: number;
  failed: number;
  skipped: number;
  results: Array<{
    locationId: string;
    locationName: string;
    hashtag: string;
    previousCount: number;
    currentCount: number;
    trendingScore: number;
  }>;
}> {
  const locationsWithHashtags = await storage.getLocationsWithHashtags();
  
  const results: Array<{
    locationId: string;
    locationName: string;
    hashtag: string;
    previousCount: number;
    currentCount: number;
    trendingScore: number;
  }> = [];
  
  let success = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`[SocialTrends] Starting update for ${locationsWithHashtags.length} locations with hashtags`);

  for (const location of locationsWithHashtags) {
    if (!location.instagramHashtag) {
      skipped++;
      continue;
    }

    const newPostCount = await fetchHashtagPostCount(location.instagramHashtag);
    
    if (newPostCount === null) {
      failed++;
      continue;
    }

    const previousCount = location.currentPostCount || 0;
    const trendingScore = calculateTrendingScore(newPostCount, previousCount);

    try {
      await storage.updateLocationSocialData(location.id, {
        currentPostCount: newPostCount,
        previousPostCount: previousCount,
        trendingScore: trendingScore,
        socialLastUpdated: new Date(),
      });

      results.push({
        locationId: location.id,
        locationName: location.name,
        hashtag: location.instagramHashtag,
        previousCount,
        currentCount: newPostCount,
        trendingScore,
      });

      success++;
      console.log(`[SocialTrends] Updated ${location.name}: ${previousCount} -> ${newPostCount} (${trendingScore.toFixed(2)}%)`);
    } catch (error) {
      console.error(`[SocialTrends] Failed to update ${location.name}:`, error);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`[SocialTrends] Update complete: ${success} success, ${failed} failed, ${skipped} skipped`);

  return { success, failed, skipped, results };
}

export async function getTrendingSpots(limit: number = 5): Promise<Location[]> {
  return storage.getTrendingLocations(limit);
}
