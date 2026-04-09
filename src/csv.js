/**
 * CSV read/write — maintains the same column structure as the original
 * Excel tracker:
 *
 *   Keyword | Avg Monthly Searches | [date] Mobile | [date] Desktop | ...
 *
 * Each run appends two new columns (Mobile + Desktop) with today's date.
 */

import { createReadStream, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { parse } from "csv-parse";
import { createObjectCsvWriter } from "csv-writer";
import { createWriteStream } from "fs";

/**
 * Load an existing rankings CSV into memory.
 * Returns { headers: string[], rows: object[] }
 * or null if the file doesn't exist yet.
 *
 * @param {string} filePath
 * @returns {Promise<{headers: string[], rows: object[]} | null>}
 */
export async function loadCSV(filePath) {
  if (!existsSync(filePath)) return null;

  return new Promise((resolve, reject) => {
    const rows = [];
    const parser = parse({ columns: true, skip_empty_lines: true, trim: true });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) rows.push(record);
    });

    parser.on("end", () => {
      const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
      resolve({ headers, rows });
    });

    parser.on("error", reject);
    createReadStream(filePath).pipe(parser);
  });
}

/**
 * Build the full CSV content and write it to disk.
 *
 * @param {string} filePath
 * @param {Array<{group: string, keyword: string, avg_monthly_searches: number}>} keywords
 * @param {string} dateLabel               - e.g. '2026-04-08'
 * @param {Map<string, number>} desktop    - keyword (lc) → position
 * @param {Map<string, number>|null} mobile
 * @param {{headers: string[], rows: object[]} | null} existing - previous CSV data
 */
export async function writeCSV(
  filePath,
  keywords,
  dateLabel,
  desktop,
  mobile,
  existing,
) {
  // Ensure output directory exists
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const mobileHeader = `${dateLabel} Mobile`;
  const desktopHeader = `${dateLabel} Desktop`;

  // Base columns
  const baseHeaders = ["Group", "Keyword", "Avg Monthly Searches"];

  // Prior date columns from existing file (minus base headers)
  const priorDateHeaders = existing
    ? existing.headers.filter((h) => !baseHeaders.includes(h))
    : [];

  // New columns for today
  const newHeaders = mobile ? [mobileHeader, desktopHeader] : [desktopHeader];

  // Deduplicate (in case the script is run twice on the same day)
  const allDateHeaders = [
    ...priorDateHeaders.filter(
      (h) => h !== mobileHeader && h !== desktopHeader,
    ),
    ...newHeaders,
  ];

  const allHeaders = [...baseHeaders, ...allDateHeaders];

  // Build a lookup from existing rows by keyword (lowercase)
  const existingByKw = new Map();
  if (existing) {
    for (const row of existing.rows) {
      existingByKw.set((row["Keyword"] ?? "").toLowerCase().trim(), row);
    }
  }

  const outputRows = keywords.map((kw) => {
    const lc = kw.keyword.toLowerCase().trim();
    const prior = existingByKw.get(lc) ?? {};

    const row = {
      Group: kw.group,
      Keyword: kw.keyword,
      "Avg Monthly Searches": kw.avg_monthly_searches,
    };

    // Copy prior date columns
    for (const h of priorDateHeaders) {
      if (h !== mobileHeader && h !== desktopHeader) {
        row[h] = prior[h] ?? "";
      }
    }

    // New rankings
    if (mobile) {
      row[mobileHeader] = mobile.get(lc) ?? "n/r";
    }
    row[desktopHeader] = desktop.get(lc) ?? "n/r";

    return row;
  });

  // Write using csv-writer
  const writer = createObjectCsvWriter({
    path: filePath,
    header: allHeaders.map((id) => ({ id, title: id })),
  });

  await writer.writeRecords(outputRows);

  console.log(`[CSV] Wrote ${outputRows.length} rows → ${filePath}`);
  console.log(`[CSV] Columns: ${allHeaders.join(" | ")}`);
}
