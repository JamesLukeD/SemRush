/**
 * SEMrush API client
 *
 * Supports two modes:
 *  1. Position Tracking (if SEMRUSH_PROJECT_ID is set)
 *     → fetches both desktop + mobile positions from a pre-configured campaign
 *  2. Organic Research fallback (no project needed)
 *     → fetches desktop positions via domain_organic endpoint
 */

import axios from "axios";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://api.semrush.com";
const MANAGEMENT_URL = "https://api.semrush.com/management/v1";

// SEMrush API throttle: 10 req/s on most plans — we stay conservative
const DELAY_MS = 200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Cache helpers ────────────────────────────────────────────────────────────

function cacheRead(cacheDir, date, device) {
  const file = resolve(cacheDir, `${date}-${device}.json`);
  if (!existsSync(file)) return null;
  try {
    const raw = JSON.parse(readFileSync(file, "utf-8"));
    console.log(`[Cache] Loaded ${device} rankings from ${file}`);
    return new Map(raw);
  } catch {
    return null;
  }
}

function cacheWrite(cacheDir, date, device, map) {
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
  const file = resolve(cacheDir, `${date}-${device}.json`);
  writeFileSync(file, JSON.stringify([...map]));
  console.log(`[Cache] Saved ${device} rankings → ${file}`);
}

/**
 * Fetch rankings using the Position Tracking project.
 * Requires a campaign to already be set up in SEMrush dashboard.
 *
 * @param {string} projectId   - SEMrush project ID
 * @param {string} apiKey      - SEMrush API key
 * @param {'desktop'|'mobile'} device
 * @param {string} database    - e.g. 'uk'
 * @returns {Map<string, number>} keyword (lowercase) → position
 */
export async function fetchPositionTracking(
  projectId,
  apiKey,
  device,
  database = "uk",
) {
  const results = new Map();
  let offset = 0;
  const limit = 5000;

  while (true) {
    const response = await axios.get(
      `${MANAGEMENT_URL}/projects/${projectId}/tracking/position`,
      {
        params: {
          key: apiKey,
          device,
          db: database,
          display_limit: limit,
          display_offset: offset,
        },
        timeout: 30_000,
      },
    );

    const rows = response.data?.data ?? response.data;

    if (!rows || (Array.isArray(rows) && rows.length === 0)) break;

    for (const row of rows) {
      // SEMrush returns keyword in `keyword` or `phrase` field
      const kw = (row.keyword ?? row.phrase ?? "").toLowerCase().trim();
      const pos = row.position ?? row.pos ?? null;
      if (kw && pos != null) {
        results.set(kw, Number(pos));
      }
    }

    if (rows.length < limit) break;
    offset += limit;
    await sleep(DELAY_MS);
  }

  return results;
}

/**
 * Fetch desktop organic positions for a domain via the Organic Research API.
 * No campaign setup required; data is updated approximately monthly by SEMrush.
 *
 * @param {string} domain   - e.g. 'www.cawarden.co.uk'
 * @param {string} apiKey
 * @param {string} database - e.g. 'uk'
 * @param {Set<string>} [targetKeywords] - stop early once all found (saves API units)
 * @returns {Map<string, {position: number, url: string}>}
 */
export async function fetchDomainOrganic(
  domain,
  apiKey,
  database = "uk",
  targetKeywords = null,
) {
  const results = new Map();

  // Single fetch of 500 rows — ~5,000 API units.
  // cawardenreclaim.co.uk ranks for ~500 keywords; our 368 targets should be within that.
  const response = await axios.get(BASE_URL, {
    params: {
      type: "domain_organic",
      domain,
      database,
      key: apiKey,
      display_limit: 500,
      export_columns: "Ph,Po",
    },
    timeout: 30_000,
  });

  const text = response.data;
  if (!text || typeof text !== "string") return results;

  // SEMrush returns errors as plain text with HTTP 200 — detect and throw
  if (typeof text === "string" && text.trimStart().startsWith("ERROR")) {
    throw new Error(`SEMrush API error: ${text.trim()}`);
  }

  const lines = text.trim().split("\n");
  if (lines.length <= 1) return results; // only header, no data

  // Header row: "Keyword;Position"
  const headers = lines[0].split(";");
  const phIdx = headers.indexOf("Keyword");
  const poIdx = headers.indexOf("Position");

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    const kw = (cols[phIdx] ?? "").toLowerCase().trim();
    const pos = parseInt(cols[poIdx], 10);
    if (kw && !isNaN(pos)) {
      results.set(kw, { position: pos, url: "" });
    }
  }

  const found = targetKeywords
    ? [...targetKeywords].filter((k) => results.has(k)).length
    : results.size;
  console.log(
    `[SEMrush] Fetched ${results.size} organic rows — found ${found}${targetKeywords ? `/${targetKeywords.size}` : ""} target keywords`,
  );

  return results;
}

/**
 * Build a keyword→position map for a list of target keywords.
 * Uses Position Tracking (mobile+desktop) if projectId is set,
 * otherwise falls back to Organic Research (desktop only).
 *
 * Safety options (via cfg):
 *  - dryRun:   skip real API calls; return mock positions for every keyword
 *  - cacheDir: directory to cache results; same-day re-runs read from cache
 *
 * @param {Array<{keyword: string}>} keywords
 * @param {object} cfg
 * @returns {{ desktop: Map<string,number>, mobile: Map<string,number>|null }}
 */
export async function fetchRankings(keywords, cfg) {
  const { apiKey, projectId, domain, database, dryRun, cacheDir, trackDate } =
    cfg;

  // ── Dry-run: return mock data, zero API units spent ─────────────────────────
  if (dryRun) {
    console.log(
      `[SEMrush] DRY RUN — returning mock positions (no API calls made)`,
    );
    const mock = (seed) =>
      new Map(
        keywords.map((kw, i) => [
          kw.keyword.toLowerCase().trim(),
          ((i * 7 + seed) % 100) + 1,
        ]),
      );
    return { desktop: mock(3), mobile: mock(11) };
  }

  // ── Helper: fetch with cache ─────────────────────────────────────────────────
  async function cachedFetch(device, fetcher) {
    if (cacheDir && trackDate) {
      const cached = cacheRead(cacheDir, trackDate, device);
      if (cached) return cached;
    }
    const result = await fetcher();
    if (cacheDir && trackDate) cacheWrite(cacheDir, trackDate, device, result);
    return result;
  }

  if (projectId) {
    console.log(
      `[SEMrush] Trying Position Tracking API (project ${projectId})…`,
    );
    try {
      const [desktop, mobile] = await Promise.all([
        cachedFetch("desktop", () =>
          fetchPositionTracking(projectId, apiKey, "desktop", database),
        ),
        cachedFetch("mobile", () =>
          fetchPositionTracking(projectId, apiKey, "mobile", database),
        ),
      ]);
      return { desktop, mobile };
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400 || status === 403 || status === 401) {
        console.warn(
          `[SEMrush] Position Tracking API returned ${status} — this plan may require OAuth.`,
        );
        console.warn(
          `[SEMrush] Falling back to Organic Research (desktop only)…`,
        );
      } else {
        throw err;
      }
    }
  }

  console.log(`[SEMrush] Using Organic Research (desktop only)`);
  const targetSet = new Set(keywords.map((k) => k.keyword.toLowerCase().trim()));
  const organic = await cachedFetch("organic", () =>
    fetchDomainOrganic(domain, apiKey, database, targetSet),
  );

  // fetchDomainOrganic returns Map<kw, {position, url}> — normalise to position only
  const desktop = new Map();
  for (const [kw, data] of organic.entries()) {
    // cached data may already be position-only (number) if loaded from disk
    desktop.set(kw, typeof data === "number" ? data : data.position);
  }

  return { desktop, mobile: null };
}
