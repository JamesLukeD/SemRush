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

const BASE_URL = "https://api.semrush.com";
const MANAGEMENT_URL = "https://api.semrush.com/management/v1";

// SEMrush API throttle: 10 req/s on most plans — we stay conservative
const DELAY_MS = 200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
 * @returns {Map<string, {position: number, url: string}>}
 */
export async function fetchDomainOrganic(domain, apiKey, database = "uk") {
  const results = new Map();
  let offset = 0;
  const limit = 10_000;

  while (true) {
    const response = await axios.get(BASE_URL, {
      params: {
        type: "domain_organic",
        domain,
        database,
        key: apiKey,
        display_limit: limit,
        display_offset: offset,
        export_columns: "Ph,Po,Nq,Ur",
        export_escape: 1,
      },
      timeout: 30_000,
    });

    const text = response.data;
    if (!text || typeof text !== "string") break;

    const lines = text.trim().split("\n");
    if (lines.length <= 1) break; // only header, no data

    // First line is the CSV header
    const headers = lines[0].split(";");
    const phIdx = headers.indexOf("Keyword");
    const poIdx = headers.indexOf("Position");
    const urIdx = headers.indexOf("URL");

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(";");
      const kw = (cols[phIdx] ?? "").toLowerCase().trim();
      const pos = parseInt(cols[poIdx], 10);
      const url = cols[urIdx] ?? "";
      if (kw && !isNaN(pos)) {
        results.set(kw, { position: pos, url });
      }
    }

    if (lines.length - 1 < limit) break;
    offset += limit;
    await sleep(DELAY_MS);
  }

  return results;
}

/**
 * Build a keyword→position map for a list of target keywords.
 * Uses Position Tracking (mobile+desktop) if projectId is set,
 * otherwise falls back to Organic Research (desktop only).
 *
 * @param {string[]} keywords       - target keywords to look up
 * @param {object}  cfg             - env config
 * @returns {{ desktop: Map<string,number>, mobile: Map<string,number>|null }}
 */
export async function fetchRankings(keywords, cfg) {
  const { apiKey, projectId, domain, database } = cfg;

  if (projectId) {
    console.log(`[SEMrush] Using Position Tracking (project ${projectId})`);
    const [desktop, mobile] = await Promise.all([
      fetchPositionTracking(projectId, apiKey, "desktop", database),
      fetchPositionTracking(projectId, apiKey, "mobile", database),
    ]);
    return { desktop, mobile };
  }

  console.log(
    `[SEMrush] No project ID set — using Organic Research (desktop only)`,
  );
  const organic = await fetchDomainOrganic(domain, apiKey, database);

  // Convert to position-only map
  const desktop = new Map();
  for (const [kw, data] of organic.entries()) {
    desktop.set(kw, data.position);
  }

  return { desktop, mobile: null };
}
