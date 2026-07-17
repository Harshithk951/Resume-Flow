/**
 * lib/gsc.ts — Google Search Console API Integration
 *
 * Provides programmatic access to GSC data: search analytics, sitemap
 * submission, and URL inspection. Used for internal SEO monitoring.
 *
 * Prerequisites:
 *   1. Create a GCP project and enable the Search Console API
 *   2. Create a Service Account and share it in GSC (Settings → Users)
 *   3. Set env vars: GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY, GSC_SITE_URL
 */

const GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';

interface GscCredentials {
  clientEmail: string;
  privateKey: string;
}

interface SearchAnalyticsQuery {
  startDate: string;
  endDate: string;
  dimensions?: Array<'query' | 'page' | 'country' | 'device'>;
  rowLimit?: number;
}

interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
  responseAggregationType?: string;
}

/**
 * Get the GSC credentials from environment variables.
 */
function getCredentials(): GscCredentials {
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKey = process.env.GSC_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Missing GSC credentials. Set GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY env vars.',
    );
  }

  return {
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
}

/**
 * Get the GSC site URL from environment or use the default.
 */
function getSiteUrl(): string {
  const configuredUrl = process.env.GSC_SITE_URL;
  if (configuredUrl) return configuredUrl;

  // Default to the production domain — update if yours differs
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction
    ? 'https://resumeflow.harshithkumar.in'
    : 'https://resumeflow.harshithkumar.in';
}

/**
 * Obtain an OAuth 2.0 access token for the GSC API using a
 * service account with JWT-based authentication.
 *
 * This avoids storing refresh tokens and works server-side only.
 */
async function getAccessToken(): Promise<string> {
  const { clientEmail, privateKey } = getCredentials();

  // Use Web Crypto API to create a signed JWT
  // In practice, the `googleapis` npm package handles this.
  // For a lightweight alternative, we construct the request manually.
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Encode header + payload
  const base64Url = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const signatureInput = `${base64Url(header)}.${base64Url(payload)}`;

  // Extract base64 content from PEM — handles any PEM header format
  // (e.g. `-----BEGIN PRIVATE KEY-----`, `-----BEGIN RSA PRIVATE KEY-----`,
  //  or keys with `Proc-Type: 4,ENCRYPTED` metadata headers from GCP).
  const pemContents = privateKey
    .replace(/^[\s\S]*?(?=-----BEGIN)/, '')  // Strip metadata before BEGIN
    .replace(/-----BEGIN[^-]+-----/g, '')     // Strip BEGIN header
    .replace(/-----END[^-]+-----/g, '')       // Strip END footer
    .replace(/\s/g, '');                      // Strip all whitespace
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    cryptoKey,
    new TextEncoder().encode(signatureInput),
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(
      `Failed to obtain GSC access token: ${tokenResponse.status} ${await tokenResponse.text()}`,
    );
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  return tokenData.access_token;
}

/**
 * Generic GSC API fetch wrapper.
 */
async function gscFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const accessToken = await getAccessToken();
  const siteUrl = encodeURIComponent(getSiteUrl());
  const url = `${GSC_API_BASE}/sites/${siteUrl}/${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `GSC API error [${response.status}]: ${await response.text()}`,
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch search analytics (performance data) from GSC.
 *
 * Example usage:
 * ```ts
 * const data = await getSearchAnalytics({
 *   startDate: '7daysAgo',
 *   endDate: 'today',
 *   dimensions: ['query', 'page'],
 *   rowLimit: 10,
 * });
 * ```
 */
export async function getSearchAnalytics(
  query: SearchAnalyticsQuery,
): Promise<SearchAnalyticsResponse> {
  return gscFetch<SearchAnalyticsResponse>('searchAnalytics/query', {
    method: 'POST',
    body: JSON.stringify({
      startDate: query.startDate,
      endDate: query.endDate,
      dimensions: query.dimensions ?? ['query'],
      rowLimit: query.rowLimit ?? 25,
    }),
  });
}

/**
 * Get performance summary for a specific URL.
 */
export async function getUrlPerformance(page: string) {
  const data = await getSearchAnalytics({
    startDate: '28daysAgo',
    endDate: 'today',
    dimensions: ['query', 'page'],
    rowLimit: 25,
  });

  // Filter results for the specific page
  const pageData = data.rows?.filter((row) => row.keys[1] === page) ?? [];

  return {
    totalClicks: pageData.reduce((s, r) => s + r.clicks, 0),
    totalImpressions: pageData.reduce((s, r) => s + r.impressions, 0),
    averagePosition:
      pageData.reduce((s, r) => s + r.position, 0) / (pageData.length || 1),
    topQueries: pageData.slice(0, 5),
  };
}

/**
 * Get weekly performance snapshot (clicks, impressions, avg position).
 */
export async function getWeeklySnapshot() {
  const data = await getSearchAnalytics({
    startDate: '7daysAgo',
    endDate: 'today',
    dimensions: ['query'],
    rowLimit: 50,
  });

  const rows = data.rows ?? [];

  return {
    totalClicks: rows.reduce((s, r) => s + r.clicks, 0),
    totalImpressions: rows.reduce((s, r) => s + r.impressions, 0),
    averageCtr:
      rows.reduce((s, r) => s + r.ctr, 0) / (rows.length || 1),
    averagePosition:
      rows.reduce((s, r) => s + r.position, 0) / (rows.length || 1),
    topPages: rows
      .filter((r) => r.keys[0])
      .slice(0, 10)
      .map((r) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
      })),
  };
}

/**
 * Submit a sitemap to GSC programmatically.
 */
export async function submitSitemap(sitemapPath: string) {
  const accessToken = await getAccessToken();
  const siteUrl = encodeURIComponent(getSiteUrl());
  const feedPath = encodeURIComponent(
    `${getSiteUrl().replace(/\/$/, '')}/${sitemapPath.replace(/^\//, '')}`,
  );

  const response = await fetch(
    `${GSC_API_BASE}/sites/${siteUrl}/sitemaps/${feedPath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Length': '0',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to submit sitemap: ${response.status} ${await response.text()}`,
    );
  }

  return { success: true, sitemap: sitemapPath };
}

/**
 * List all submitted sitemaps.
 */
export async function listSitemaps() {
  return gscFetch<{
    sitemap: Array<{
      path: string;
      lastSubmitted: string;
      isPending: boolean;
      isSitemapsIndex: boolean;
      type: string;
      errors: number;
      warnings: number;
      contents: Array<{
        type: string;
        submitted: number;
        indexed: number;
      }>;
    }>;
  }>('sitemaps');
}

/**
 * Check indexing status of a specific URL via the URL Inspection API.
 *
 * Uses the v1 URL Inspection endpoint (different base from search analytics).
 */
export async function inspectUrl(url: string) {
  const accessToken = await getAccessToken();
  const siteUrl = getSiteUrl();

  const response = await fetch(
    'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspectionUrl: url,
        siteUrl: siteUrl,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `URL Inspection API error [${response.status}]: ${await response.text()}`,
    );
  }

  const data = (await response.json()) as {
    inspectionResult: {
      indexStatusResult: {
        verdict: string;
        coverageState: string;
        indexingState: string;
        crawlingState: string;
        pageFetchState: string;
        robotsTxtState: string;
        sitemap: string[];
        userCanonicalUrl: string;
        googleCanonicalUrl: string;
      };
      mobileUsabilityResult: {
        verdict: string;
      };
      richResultsResult: {
        verdict: string;
        detectedItems: Array<{
          richResultType: string;
          items: Array<{
            name: string;
          }>;
        }>;
      };
    };
  };

  return data;
}
