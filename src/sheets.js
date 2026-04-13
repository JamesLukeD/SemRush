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
 * Each data cell is conditionally formatted vs the previous week:
 *   Green = rank improved (lower number)
 *   Red   = rank dropped  (higher number)
 *
 * Authentication uses a service account (easiest for CI/CD).
 * Share the spreadsheet with the service account email first.
 */

import { google } from "googleapis";

// Number of fixed left-hand columns (Group | Keyword | Avg Monthly Searches)
const BASE_COLS = 3;

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
 * Get the numeric sheetId for a named sheet tab.
 * @param {import('googleapis').sheets_v4.Sheets} sheets
 * @param {string} spreadsheetId
 * @param {string} sheetName
 * @returns {Promise<number>}
 */
async function getSheetId(sheets, spreadsheetId, sheetName) {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = res.data.sheets.find((s) => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet tab "${sheetName}" not found`);
  return sheet.properties.sheetId;
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
 * Build a pair of green/red conditional format rules for one column,
 * comparing it to a previous column of the same device type.
 *
 * Green = current rank < previous rank (improved)
 * Red   = current rank > previous rank (dropped)
 *
 * @param {number} sheetId        - numeric sheet ID
 * @param {number} colIndex       - 0-based index of the new column
 * @param {number} prevColIndex   - 0-based index of the comparison column
 * @param {number} firstDataRow   - 0-based row index of first data row (row 3 = 2)
 * @param {number} lastDataRow    - 0-based exclusive end row
 * @returns {object[]} array of batchUpdate request objects
 */
function makeGreenRedRules(
  sheetId,
  colIndex,
  prevColIndex,
  firstDataRow,
  lastDataRow,
) {
  const col = colIndexToLetter(colIndex);
  const prevCol = colIndexToLetter(prevColIndex);
  const refRow = firstDataRow + 1; // 1-based row number for the formula anchor

  const range = {
    sheetId,
    startRowIndex: firstDataRow,
    endRowIndex: lastDataRow,
    startColumnIndex: colIndex,
    endColumnIndex: colIndex + 1,
  };

  return [
    // Green: rank improved (smaller number = higher on SERP)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [range],
          booleanRule: {
            condition: {
              type: "CUSTOM_FORMULA",
              values: [
                {
                  userEnteredValue: `=AND(ISNUMBER(${col}${refRow}),ISNUMBER(${prevCol}${refRow}),${col}${refRow}<${prevCol}${refRow})`,
                },
              ],
            },
            format: {
              backgroundColor: { red: 0.718, green: 0.882, blue: 0.804 }, // #b7e1cd
            },
          },
        },
        index: 0,
      },
    },
    // Red: rank dropped (larger number = lower on SERP)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [range],
          booleanRule: {
            condition: {
              type: "CUSTOM_FORMULA",
              values: [
                {
                  userEnteredValue: `=AND(ISNUMBER(${col}${refRow}),ISNUMBER(${prevCol}${refRow}),${col}${refRow}>${prevCol}${refRow})`,
                },
              ],
            },
            format: {
              backgroundColor: { red: 0.957, green: 0.8, blue: 0.8 }, // #f4cccc
            },
          },
        },
        index: 0,
      },
    },
  ];
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

  const numNewCols = mobile ? 2 : 1;

  // Fetch next empty column, numeric sheetId, and keyword column (A) in parallel
  const [startColIndex, sheetId, kwColRes] = await Promise.all([
    findNextEmptyColumn(sheets, spreadsheetId, sheetName),
    getSheetId(sheets, spreadsheetId, sheetName),
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName}'!A:A`,
    }),
  ]);

  // Build keyword (lowercase) → 1-based sheet row map from column A
  // This handles group header rows being interspersed with keyword rows.
  const sheetColA = kwColRes.data.values ?? [];
  const kwRowMap = new Map();
  for (let i = 0; i < sheetColA.length; i++) {
    const cell = (sheetColA[i]?.[0] ?? "").toLowerCase().trim();
    if (cell) kwRowMap.set(cell, i + 1); // convert to 1-based row number
  }

  const startCol = colIndexToLetter(startColIndex);
  const endCol = colIndexToLetter(startColIndex + numNewCols - 1);

  // Write date + sub-header into rows 1 and 2
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!${startCol}1:${endCol}2`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [dateLabel, ...(mobile ? [""] : [])],
        mobile ? ["Mobile", "Desktop"] : ["Desktop"],
      ],
    },
  });

  // Build one update entry per keyword, written to its actual row in the sheet
  const data = [];
  let maxRow = 0;

  for (const kw of keywords) {
    const lc = kw.keyword.toLowerCase().trim();
    const row = kwRowMap.get(lc);
    if (row == null) continue; // keyword not found in sheet — skip
    if (row > maxRow) maxRow = row;

    data.push({
      range: `'${sheetName}'!${startCol}${row}:${endCol}${row}`,
      values: mobile
        ? [[mobile.get(lc) ?? "n/r", desktop.get(lc) ?? "n/r"]]
        : [[desktop.get(lc) ?? "n/r"]],
    });
  }

  if (data.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "RAW", data },
    });
  }

  console.log(
    `[Sheets] Wrote ${data.length} rankings to column(s) ${startCol}${mobile ? `–${endCol}` : ""}`,
  );

  // ── Conditional formatting (green/red vs previous week) ─────────────────────
  const canCompare = mobile
    ? startColIndex >= BASE_COLS + 2
    : startColIndex >= BASE_COLS + 1;

  if (canCompare && maxRow > 0) {
    const firstDataRow = 2; // 0-based index (row 3 in Sheets = index 2)
    // maxRow is 1-based last row → used as 0-based exclusive end index
    const requests = [];

    if (mobile) {
      requests.push(
        ...makeGreenRedRules(
          sheetId,
          startColIndex,
          startColIndex - 2,
          firstDataRow,
          maxRow,
        ),
        ...makeGreenRedRules(
          sheetId,
          startColIndex + 1,
          startColIndex - 1,
          firstDataRow,
          maxRow,
        ),
      );
    } else {
      requests.push(
        ...makeGreenRedRules(
          sheetId,
          startColIndex,
          startColIndex - 1,
          firstDataRow,
          maxRow,
        ),
      );
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });

    console.log(`[Sheets] Applied green/red conditional formatting`);
  }
}
