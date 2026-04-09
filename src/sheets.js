/**
 * Google Sheets integration
 *
 * Appends two new columns (Mobile + Desktop) to the existing sheet,
 * matching the layout of the original Excel tracker:
 *
 *   Row 1 (header A-row):  ... | [date] | (empty) |
 *   Row 2 (sub-header):    ... | Mobile | Desktop |
 *   Row 3+:                ... | <rank> | <rank>  |
 *
 * Authentication uses a service account (easiest for CI/CD).
 * Share the spreadsheet with the service account email first.
 */

import { google } from "googleapis";

/**
 * Build an authenticated Google Sheets client.
 * @param {object} cfg
 * @returns {import('googleapis').sheets_v4.Sheets}
 */
function buildSheetsClient(cfg) {
  const auth = new google.auth.JWT({
    email: cfg.serviceAccountEmail,
    key: cfg.privateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

/**
 * Find the next empty column in the header row (row 1) of the sheet.
 *
 * @param {import('googleapis').sheets_v4.Sheets} sheets
 * @param {string} spreadsheetId
 * @param {string} sheetName
 * @returns {Promise<number>} 0-based column index
 */
async function findNextEmptyColumn(sheets, spreadsheetId, sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!1:1`,
  });

  const firstRow = res.data.values?.[0] ?? [];
  return firstRow.length; // next empty = length (0-indexed)
}

/**
 * Convert a 0-based column index to A1 notation (A, B, … Z, AA, AB, …).
 * @param {number} index
 * @returns {string}
 */
function colIndexToLetter(index) {
  let result = "";
  let n = index;
  while (n >= 0) {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

/**
 * Append mobile + desktop ranking columns to the Google Sheet.
 *
 * @param {string[]} keywords       - ordered keyword list (matches sheet rows from row 3)
 * @param {string} dateLabel        - e.g. '2026-04-08'
 * @param {Map<string, number>} desktop
 * @param {Map<string, number>|null} mobile
 * @param {object} cfg              - sheets config
 */
export async function appendToSheet(keywords, dateLabel, desktop, mobile, cfg) {
  const sheets = buildSheetsClient(cfg);
  const { spreadsheetId, sheetName } = cfg;

  // Determine how many new columns to append
  const numNewCols = mobile ? 2 : 1;
  const startColIndex = await findNextEmptyColumn(
    sheets,
    spreadsheetId,
    sheetName,
  );

  const startCol = colIndexToLetter(startColIndex);
  const endCol = colIndexToLetter(startColIndex + numNewCols - 1);

  // Row 1: date label spanning new columns, row 2: sub-headers
  const dateRow = [dateLabel, ...(mobile ? [""] : [])];
  const subHeaderRow = mobile ? ["Mobile", "Desktop"] : ["Desktop"];

  // Rows 3+: rankings in the same order as the sheet
  const rankRows = keywords.map((kw) => {
    const lc = kw.keyword.toLowerCase().trim();
    if (mobile) {
      return [mobile.get(lc) ?? "n/r", desktop.get(lc) ?? "n/r"];
    }
    return [desktop.get(lc) ?? "n/r"];
  });

  // Combine all rows: [dateRow, subHeaderRow, ...rankRows]
  const values = [dateRow, subHeaderRow, ...rankRows];

  // Number of rows in the sheet = 2 header rows + keywords
  const lastDataRow = 2 + keywords.length;

  const range = `'${sheetName}'!${startCol}1:${endCol}${lastDataRow}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  console.log(`[Sheets] Wrote ${keywords.length} rankings to ${range}`);
}
