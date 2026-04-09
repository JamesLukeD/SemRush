/**
 * SERP Tracker — main entry point
 *
 * Usage:
 *   node src/index.js                      # run today
 *   TRACK_DATE=2026-04-01 node src/index.js  # override date
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

import { fetchRankings } from "./semrush.js";
import { loadCSV, writeCSV } from "./csv.js";
import { appendToSheet } from "./sheets.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Config ─────────────────────────────────────────────────────────────────

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    console.error(`[Error] Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return val;
}

const cfg = {
  // SEMrush
  apiKey: requireEnv("SEMRUSH_API_KEY"),
  projectId: process.env.SEMRUSH_PROJECT_ID || null,
  domain: requireEnv("DOMAIN"),
  database: process.env.SEMRUSH_DATABASE || "uk",

  // Google Sheets
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || null,
  sheetName: process.env.GOOGLE_SHEET_NAME || "Updated Sheet",
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || null,
  privateKey: process.env.GOOGLE_PRIVATE_KEY || null,

  // Output
  csvPath: resolve(ROOT, process.env.CSV_OUTPUT_PATH || "./data/rankings.csv"),
};

// Date for this run (YYYY-MM-DD)
const trackDate = process.env.TRACK_DATE
  ? process.env.TRACK_DATE
  : new Date().toISOString().slice(0, 10);

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n========================================`);
  console.log(` SERP Tracker — ${trackDate}`);
  console.log(` Domain  : ${cfg.domain}`);
  console.log(` Database: ${cfg.database}`);
  console.log(`========================================\n`);

  // 1. Load keywords
  const keywordsPath = resolve(ROOT, "keywords.json");
  const keywords = JSON.parse(readFileSync(keywordsPath, "utf-8"));
  console.log(
    `[Keywords] Loaded ${keywords.length} keywords across ${new Set(keywords.map((k) => k.group)).size} groups`,
  );

  // 2. Fetch rankings from SEMrush
  const { desktop, mobile } = await fetchRankings(keywords, cfg);
  console.log(`[SEMrush] Desktop results: ${desktop.size}`);
  if (mobile) console.log(`[SEMrush] Mobile  results: ${mobile.size}`);

  // Log summary stats (how many tracked keywords have a ranking)
  let desktopFound = 0;
  let mobileFound = 0;
  for (const kw of keywords) {
    const lc = kw.keyword.toLowerCase().trim();
    if (desktop.has(lc)) desktopFound++;
    if (mobile?.has(lc)) mobileFound++;
  }
  console.log(
    `[Stats] ${desktopFound}/${keywords.length} keywords ranked (desktop)`,
  );
  if (mobile)
    console.log(
      `[Stats] ${mobileFound}/${keywords.length} keywords ranked (mobile)`,
    );

  // 3. Write CSV
  const existing = await loadCSV(cfg.csvPath);
  await writeCSV(cfg.csvPath, keywords, trackDate, desktop, mobile, existing);

  // 4. Update Google Sheets (if configured)
  const sheetsReady =
    cfg.spreadsheetId && cfg.serviceAccountEmail && cfg.privateKey;

  if (sheetsReady) {
    console.log(`[Sheets] Updating spreadsheet ${cfg.spreadsheetId} …`);
    await appendToSheet(keywords, trackDate, desktop, mobile, cfg);
  } else {
    console.log(
      `[Sheets] Skipping — GOOGLE_SPREADSHEET_ID / credentials not set`,
    );
  }

  console.log(`\n[Done] Tracking run complete for ${trackDate}`);
}

main().catch((err) => {
  console.error("[Fatal]", err.message ?? err);
  process.exit(1);
});
