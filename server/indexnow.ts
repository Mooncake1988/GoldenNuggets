const INDEXNOW_API_ENDPOINT = "https://api.indexnow.org/indexnow";
const CANONICAL_BASE_URL = "https://lekkerspots.co.za";
const CANONICAL_HOST = "lekkerspots.co.za";

interface IndexNowSubmitResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

export function getIndexNowApiKey(): string | undefined {
  return process.env.INDEXNOW_API_KEY;
}

export function buildLocationUrl(slug: string): string {
  return `${CANONICAL_BASE_URL}/location/${encodeURIComponent(slug)}`;
}

export async function submitUrlToIndexNow(url: string): Promise<IndexNowSubmitResult> {
  const apiKey = getIndexNowApiKey();
  
  if (!apiKey) {
    console.warn("[IndexNow] API key not configured, skipping submission");
    return { success: false, error: "API key not configured" };
  }

  try {
    const params = new URLSearchParams({
      url: url,
      key: apiKey,
    });

    const response = await fetch(`${INDEXNOW_API_ENDPOINT}?${params.toString()}`, {
      method: "GET",
    });

    const statusCode = response.status;

    if (statusCode === 200 || statusCode === 202) {
      console.log(`[IndexNow] Successfully submitted URL: ${url} (status: ${statusCode})`);
      return { success: true, statusCode };
    } else {
      console.error(`[IndexNow] Failed to submit URL: ${url} (status: ${statusCode})`);
      return { success: false, statusCode, error: `HTTP ${statusCode}` };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[IndexNow] Error submitting URL: ${url}`, error);
    return { success: false, error: errorMessage };
  }
}

export async function submitMultipleUrlsToIndexNow(urls: string[]): Promise<IndexNowSubmitResult> {
  const apiKey = getIndexNowApiKey();
  
  if (!apiKey) {
    console.warn("[IndexNow] API key not configured, skipping submission");
    return { success: false, error: "API key not configured" };
  }

  if (urls.length === 0) {
    return { success: true };
  }

  try {
    const payload = {
      host: CANONICAL_HOST,
      key: apiKey,
      urlList: urls,
    };

    const response = await fetch(INDEXNOW_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const statusCode = response.status;

    if (statusCode === 200 || statusCode === 202) {
      console.log(`[IndexNow] Successfully submitted ${urls.length} URLs (status: ${statusCode})`);
      return { success: true, statusCode };
    } else {
      console.error(`[IndexNow] Failed to submit ${urls.length} URLs (status: ${statusCode})`);
      return { success: false, statusCode, error: `HTTP ${statusCode}` };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[IndexNow] Error submitting URLs`, error);
    return { success: false, error: errorMessage };
  }
}

export async function notifyLocationCreated(slug: string): Promise<void> {
  const url = buildLocationUrl(slug);
  await submitUrlToIndexNow(url);
}

export async function notifyLocationUpdated(slug: string): Promise<void> {
  const url = buildLocationUrl(slug);
  await submitUrlToIndexNow(url);
}

export async function notifyLocationDeleted(slug: string): Promise<void> {
  const url = buildLocationUrl(slug);
  await submitUrlToIndexNow(url);
}
