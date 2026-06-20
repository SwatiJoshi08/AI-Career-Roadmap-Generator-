// Using global fetch

/**
 * Checks a URL using a HEAD request (fallback to GET if HEAD fails).
 * Treats 2xx/3xx as alive, everything else or timeout as broken.
 */
export async function checkLinkHealth(
  url: string,
  timeoutMs = 4000
): Promise<{ isAlive: boolean; statusCode?: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const requestOpts: any = {
    method: 'HEAD',
    signal: controller.signal as any, // type workaround if needed
  };

  try {
    const res = await fetch(url, requestOpts);
    clearTimeout(timeout);
    if (res.ok) {
      return { isAlive: true, statusCode: res.status };
    }
    // Some sites reject HEAD – try GET quickly
    return await retryWithGet(url, timeoutMs);
  } catch (e) {
    // HEAD failed (network error, abort, etc.) – try GET
    clearTimeout(timeout);
    return await retryWithGet(url, timeoutMs);
  }
}

/** Helper – GET request that aborts body after headers are received */
async function retryWithGet(
  url: string,
  timeoutMs: number
): Promise<{ isAlive: boolean; statusCode?: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal as any,
    });
    clearTimeout(timeout);
    // We only need the status code; close the body immediately
    if (res.body && typeof (res.body as any).cancel === 'function') {
      // Node >=20 streams have .cancel()
      (res.body as any).cancel();
    }
    return { isAlive: res.ok, statusCode: res.status };
  } catch {
    clearTimeout(timeout);
    return { isAlive: false };
  }
}

/**
 * Generates a fallback Google search URL for a resource name.
 */
export function generateFallbackSearchUrl(resourceName: string): string {
  return `https://www.google.com/search?q=search+google.com`;
}
