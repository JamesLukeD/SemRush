/**
 * One-time script: builds keywords.json and data/seed.csv from the
 * historical data extracted from the Cawarden SERP tracking PDF.
 *
 * Run once:  node scripts/build-seed.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createObjectCsvWriter } from "csv-writer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Historical data from PDF ─────────────────────────────────────────────────
// Format: [keyword, avg_monthly_searches, m_27jan, d_27jan, m_2feb, d_2feb, m_16feb, d_16feb]
// null = no data for that date/device
// 0    = tracked but not in top 100

const data = [
  // ── Ridge Tiles ──────────────────────────────────────────────────────────────
  {
    group: "Ridge Tiles",
    keyword: "antique ridge tiles",
    avg: 50,
    h: [15, 4, 13, 3, 4, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "antique ridge tile",
    avg: null,
    h: [21, 11, 21, 21, 19, 20],
  },
  {
    group: "Ridge Tiles",
    keyword: "old ridge tiles",
    avg: 50,
    h: [7, 13, 4, 14, 7, 13],
  },
  {
    group: "Ridge Tiles",
    keyword: "old ridge tile",
    avg: null,
    h: [13, 13, 11, 12, 11, 11],
  },
  {
    group: "Ridge Tiles",
    keyword: "old clay ridge tiles",
    avg: null,
    h: [9, 10, 12, 10, 10, 13],
  },
  {
    group: "Ridge Tiles",
    keyword: "old clay ridge tile",
    avg: 10,
    h: [9, 9, 10, 9, 12, 10],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed clay ridge tile",
    avg: 10,
    h: [10, 10, 10, 10, 10, 11],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed clay ridge tiles",
    avg: 10,
    h: [11, 10, 10, 10, 12, 11],
  },
  {
    group: "Ridge Tiles",
    keyword: "ornate ridge tile",
    avg: 30,
    h: [20, 18, 20, 21, 16, 17],
  },
  {
    group: "Ridge Tiles",
    keyword: "Victorian ridge tile",
    avg: 140,
    h: [9, 10, 20, 13, 11, 8],
  },
  {
    group: "Ridge Tiles",
    keyword: "victorian ridge tiles",
    avg: null,
    h: [8, 10, 11, 17, 12, 7],
  },
  {
    group: "Ridge Tiles",
    keyword: "georgian ridge tiles",
    avg: null,
    h: [4, 5, 5, 5, 11, 5],
  },
  {
    group: "Ridge Tiles",
    keyword: "georgian ridge tile",
    avg: null,
    h: [12, 15, 12, 15, 4, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "Edwardian ridge tile",
    avg: 10,
    h: [16, 15, 15, 14, 19, 16],
  },
  {
    group: "Ridge Tiles",
    keyword: "Edwardian ridge tiles",
    avg: null,
    h: [15, 14, 18, 15, 13, 15],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed victorian ridge tiles",
    avg: 30,
    h: [4, 3, 4, 3, 4, 3],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed victorian ridge tile",
    avg: null,
    h: [4, 4, 4, 3, 4, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed blue ridge tiles",
    avg: 10,
    h: [9, 9, 9, 4, 10, 11],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed blue ridge tile",
    avg: null,
    h: [9, 10, 9, 7, 11, 10],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed red ridge tile",
    avg: null,
    h: [4, 4, 5, 5, 4, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed red ridge tiles",
    avg: null,
    h: [4, 4, 4, 4, 4, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed terracotta ridge tiles",
    avg: 10,
    h: [13, 13, 13, 10, 8, 9],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed terracotta ridge tile",
    avg: null,
    h: [10, 10, 10, 10, 14, 9],
  },
  {
    group: "Ridge Tiles",
    keyword: "half round reclaimed ridge tile",
    avg: null,
    h: [12, 13, 12, 13, 13, 13],
  },
  {
    group: "Ridge Tiles",
    keyword: "half round reclaimed ridge tiles",
    avg: null,
    h: [12, 12, 12, 12, 12, 10],
  },
  {
    group: "Ridge Tiles",
    keyword: "angled reclaimed ridge tile",
    avg: null,
    h: [11, 11, 11, 11, 12, 11],
  },
  {
    group: "Ridge Tiles",
    keyword: "angled reclaimed ridge tiles",
    avg: null,
    h: [5, 5, 5, 5, 5, 5],
  },
  {
    group: "Ridge Tiles",
    keyword: "saddleback reclaimed ridge tile",
    avg: null,
    h: [4, 4, 4, 4, 4, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "saddleback reclaimed ridge tiles",
    avg: null,
    h: [2, 3, 5, 4, 4, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "hogsback reclaimed ridge tile",
    avg: null,
    h: [17, 19, 17, 16, 15, 16],
  },
  {
    group: "Ridge Tiles",
    keyword: "hogsback reclaimed ridge tiles",
    avg: null,
    h: [18, 16, 17, 17, 17, 13],
  },
  {
    group: "Ridge Tiles",
    keyword: "acme reclaimed ridge tiles",
    avg: null,
    h: [4, 5, 12, 5, 4, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "acme reclaimed ridge tile",
    avg: null,
    h: [4, 3, 3, 3, 3, 5],
  },
  {
    group: "Ridge Tiles",
    keyword: "hawkins reclaimed ridge tile",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Ridge Tiles",
    keyword: "hawkins reclaimed ridge tiles",
    avg: null,
    h: [3, 3, 3, 3, 3, 3],
  },
  {
    group: "Ridge Tiles",
    keyword: "rosemary reclaimed ridge tiles",
    avg: null,
    h: [6, 8, 8, 10, 7, 6],
  },
  {
    group: "Ridge Tiles",
    keyword: "rosemary reclaimed ridge tile",
    avg: null,
    h: [9, 7, 9, 10, 9, 7],
  },
  {
    group: "Ridge Tiles",
    keyword: "marley reclaimed ridge tiles",
    avg: null,
    h: [11, 12, 14, 12, 15, 16],
  },
  {
    group: "Ridge Tiles",
    keyword: "marley reclaimed ridge tile",
    avg: null,
    h: [15, 14, 15, 9, 21, 15],
  },
  {
    group: "Ridge Tiles",
    keyword: "redland reclaimed ridge tiles",
    avg: null,
    h: [15, 16, 16, 14, 13, 14],
  },
  {
    group: "Ridge Tiles",
    keyword: "redland reclaimed ridge tile",
    avg: null,
    h: [16, 14, 16, 14, 13, 16],
  },
  {
    group: "Ridge Tiles",
    keyword: "russell reclaimed ridge tile",
    avg: null,
    h: [1, 1, 2, 1, 2, 2],
  },
  {
    group: "Ridge Tiles",
    keyword: "russell reclaimed ridge tiles",
    avg: null,
    h: [2, 2, 2, 2, 2, 3],
  },
  {
    group: "Ridge Tiles",
    keyword: "sandtoft reclaimed ridge tiles",
    avg: null,
    h: [17, 17, 17, 13, 21, 15],
  },
  {
    group: "Ridge Tiles",
    keyword: "sandtoft reclaimed ridge tile",
    avg: null,
    h: [14, 16, 14, 15, 14, 13],
  },
  {
    group: "Ridge Tiles",
    keyword: "dreadnought reclaimed ridge tile",
    avg: null,
    h: [9, 9, 9, 9, 11, 10],
  },
  {
    group: "Ridge Tiles",
    keyword: "dreadnought reclaimed ridge tiles",
    avg: null,
    h: [9, 9, 9, 10, 14, 13],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed ridge tiles near me",
    avg: 110,
    h: [24, 23, 24, 14, 26, 24],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed interlocking blue ridge tiles",
    avg: null,
    h: [3, 3, 4, 3, 8, 7],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed interlocking red ridge tiles",
    avg: null,
    h: [5, 3, 3, 3, 4, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "Reclaimed butt up ridge tiles",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Ridge Tiles",
    keyword: "old butt up ridge tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Ridge Tiles",
    keyword: "reclaimed angled ridge tiles",
    avg: null,
    h: [4, 2, 4, 2, 9, 4],
  },
  {
    group: "Ridge Tiles",
    keyword: "Reclaimed Concrete Ridge Tile",
    avg: null,
    h: [12, 10, 9, 10, 10, 10],
  },
  {
    group: "Ridge Tiles",
    keyword: "Reclaimed Concrete Ridge Tiles",
    avg: null,
    h: [9, 9, 9, 11, 10, 10],
  },
  {
    group: "Ridge Tiles",
    keyword: "Reclaimed Staffordshire Blue Ridge Tile",
    avg: null,
    h: [7, 7, 20, 9, 13, 13],
  },
  {
    group: "Ridge Tiles",
    keyword: "Reclaimed Staffordshire Blue Ridge Tiles",
    avg: null,
    h: [7, 7, 7, 8, 8, 7],
  },
  {
    group: "Ridge Tiles",
    keyword: "Reclaimed ridge tiles",
    avg: null,
    h: [null, null, null, null, null, null],
  },

  // ── Roof Tiles ───────────────────────────────────────────────────────────────
  {
    group: "Roof Tiles",
    keyword: "antique roof tiles",
    avg: 20,
    h: [20, 18, 20, 22, 16, 16],
  },
  {
    group: "Roof Tiles",
    keyword: "antique roof tile",
    avg: null,
    h: [36, 29, 37, 29, 37, 36],
  },
  {
    group: "Roof Tiles",
    keyword: "old roof tiles",
    avg: 260,
    h: [16, 15, 17, 14, 18, 15],
  },
  {
    group: "Roof Tiles",
    keyword: "old roof tile",
    avg: null,
    h: [15, 14, 19, 18, 20, 18],
  },
  {
    group: "Roof Tiles",
    keyword: "old clay roof tiles",
    avg: 50,
    h: [21, 22, 28, 22, 20, 22],
  },
  {
    group: "Roof Tiles",
    keyword: "old clay roof tile",
    avg: null,
    h: [20, 21, 24, 22, 19, 21],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed clay roof tile",
    avg: null,
    h: [15, 16, 14, 16, 18, 15],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed clay roof tiles",
    avg: null,
    h: [15, 12, 17, 12, 18, 16],
  },
  {
    group: "Roof Tiles",
    keyword: "fancy roof tiles",
    avg: 10,
    h: [1, 3, 1, 3, 1, 2],
  },
  {
    group: "Roof Tiles",
    keyword: "fancy roof tile",
    avg: null,
    h: [1, 2, 4, 4, 4, 1],
  },
  {
    group: "Roof Tiles",
    keyword: "Victorian roof tile",
    avg: 90,
    h: [22, 22, 22, 22, 26, 28],
  },
  {
    group: "Roof Tiles",
    keyword: "victorian roof tiles",
    avg: null,
    h: [20, 19, 21, 12, 17, 17],
  }, // fixed: 21->21
  {
    group: "Roof Tiles",
    keyword: "georgian roof tiles",
    avg: 20,
    h: [25, 26, 13, 18, 14, 14],
  },
  {
    group: "Roof Tiles",
    keyword: "georgian roof tile",
    avg: null,
    h: [24, 23, 16, 18, 15, 21],
  },
  {
    group: "Roof Tiles",
    keyword: "Edwardian roof tile",
    avg: null,
    h: [44, 23, 51, 0, 29, 0],
  },
  {
    group: "Roof Tiles",
    keyword: "Edwardian roof tiles",
    avg: 20,
    h: [45, 0, 40, 0, 0, 33],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed victorian roof tiles",
    avg: 10,
    h: [15, 12, 15, 13, 13, 13],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed victorian roof tile",
    avg: null,
    h: [13, 12, 14, 11, 11, 11],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed blue roof tiles",
    avg: null,
    h: [3, 3, 5, 4, 5, 5],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed blue roof tile",
    avg: null,
    h: [6, 6, 5, 4, 8, 8],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed red roof tile",
    avg: null,
    h: [3, 3, 5, 5, 5, 5],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed red roof tiles",
    avg: 10,
    h: [3, 3, 5, 5, 9, 5],
  },
  {
    group: "Roof Tiles",
    keyword: "Victorian terracotta roof tile",
    avg: null,
    h: [10, 18, 20, 19, 19, 20],
  }, // fixed avg: 10
  {
    group: "Roof Tiles",
    keyword: "Victorian terracotta roof tiles",
    avg: 20,
    h: [16, 16, 16, 20, 17, 16],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed terracotta roof tiles",
    avg: null,
    h: [14, 16, 14, 14, 13, 15],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed terracotta roof tile",
    avg: null,
    h: [16, 15, 13, 14, 15, 17],
  },
  {
    group: "Roof Tiles",
    keyword: "half round reclaimed roof tile",
    avg: null,
    h: [12, 10, 12, 10, 11, 12],
  },
  {
    group: "Roof Tiles",
    keyword: "half round reclaimed roof tiles",
    avg: null,
    h: [11, 9, 13, 9, 12, 11],
  },
  {
    group: "Roof Tiles",
    keyword: "angled reclaimed roof tile",
    avg: null,
    h: [8, 9, 14, 8, 10, 8],
  },
  {
    group: "Roof Tiles",
    keyword: "angled reclaimed roof tiles",
    avg: null,
    h: [9, 8, 10, 8, 10, 10],
  },
  {
    group: "Roof Tiles",
    keyword: "acme reclaimed roof tiles",
    avg: null,
    h: [13, 5, 13, 5, 10, 14],
  },
  {
    group: "Roof Tiles",
    keyword: "acme reclaimed roof tile",
    avg: null,
    h: [5, 4, 5, 5, 10, 10],
  },
  {
    group: "Roof Tiles",
    keyword: "hawkins reclaimed roof tile",
    avg: 10,
    h: [5, 5, 5, 5, 5, 3],
  },
  {
    group: "Roof Tiles",
    keyword: "hawkins reclaimed roof tiles",
    avg: 40,
    h: [5, 5, 5, 5, 4, 4],
  },
  {
    group: "Roof Tiles",
    keyword: "rosemary reclaimed roof tiles",
    avg: null,
    h: [4, 8, 4, 7, 7, 3],
  },
  {
    group: "Roof Tiles",
    keyword: "rosemary reclaimed roof tile",
    avg: 40,
    h: [3, 3, 8, 7, 9, 3],
  },
  {
    group: "Roof Tiles",
    keyword: "marley reclaimed roof tiles",
    avg: null,
    h: [10, 10, 12, 10, 12, 13],
  },
  {
    group: "Roof Tiles",
    keyword: "marley reclaimed roof tile",
    avg: null,
    h: [10, 11, 10, 10, 12, 12],
  },
  {
    group: "Roof Tiles",
    keyword: "redland reclaimed roof tiles",
    avg: null,
    h: [10, 8, 15, 11, 14, 14],
  },
  {
    group: "Roof Tiles",
    keyword: "redland reclaimed roof tile",
    avg: null,
    h: [26, 10, 15, 10, 13, 14],
  },
  {
    group: "Roof Tiles",
    keyword: "russell reclaimed roof tile",
    avg: null,
    h: [1, 2, 2, 2, 2, 2],
  },
  {
    group: "Roof Tiles",
    keyword: "russell reclaimed roof tiles",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Roof Tiles",
    keyword: "sandtoft reclaimed roof tiles",
    avg: null,
    h: [12, 14, 4, 4, 11, 12],
  },
  {
    group: "Roof Tiles",
    keyword: "sandtoft reclaimed roof tile",
    avg: null,
    h: [13, 15, 16, 15, 15, 13],
  },
  {
    group: "Roof Tiles",
    keyword: "dreadnought reclaimed roof tile",
    avg: null,
    h: [10, 10, 12, 10, 15, 13],
  },
  {
    group: "Roof Tiles",
    keyword: "dreadnought reclaimed roof tiles",
    avg: null,
    h: [7, 11, 13, 11, 8, 13],
  },
  {
    group: "Roof Tiles",
    keyword: "marley antique roof tiles",
    avg: 10,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Roof Tiles",
    keyword: "marley antique roof tile",
    avg: null,
    h: [0, 0, 0, 42, 0, 0],
  },
  {
    group: "Roof Tiles",
    keyword: "dreadnought antique roof tile",
    avg: null,
    h: [5, 17, 5, 9, 4, 4],
  },
  {
    group: "Roof Tiles",
    keyword: "dreadnought antique roof tiles",
    avg: 880,
    h: [13, 10, 13, 5, 5, 4],
  },
  {
    group: "Roof Tiles",
    keyword: "reclaimed roof tiles near me",
    avg: 720,
    h: [1, 30, 44, 0, 46, 32],
  },

  // ── Slate Tiles ──────────────────────────────────────────────────────────────
  {
    group: "Slate Tiles",
    keyword: "Reclaimed roof tiles for slate roof",
    avg: null,
    h: [4, 14, 15, 16, 15, 15],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed roof tiles for slate roofs",
    avg: null,
    h: [4, 5, 4, 13, 12, 15],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Roof Slate",
    avg: 140,
    h: [14, 12, 15, 14, 18, 17],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Roof Slates",
    avg: 140,
    h: [12, 13, 12, 16, 14, 12],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Slate roof",
    avg: 140,
    h: [11, 13, 14, 13, 5, 15],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Roof Tiles",
    avg: 880,
    h: [16, 16, 16, 24, 23, 22],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Welsh Slate",
    avg: 140,
    h: [18, 14, 13, 13, 14, 13],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Slate Roof Tiles",
    avg: 260,
    h: [7, 8, 7, 4, 6, 4],
  },
  {
    group: "Slate Tiles",
    keyword: "Used Roofing Slate for Sale",
    avg: 10,
    h: [15, 9, 16, 14, 12, 10],
  },
  {
    group: "Slate Tiles",
    keyword: "Used Slate Roof Tiles For Sale",
    avg: 20,
    h: [11, 12, 13, 12, 3, 3],
  },
  {
    group: "Slate Tiles",
    keyword: "Recycled Slate Slate Roof Tiles",
    avg: 30,
    h: [27, 26, 24, 25, 19, 13],
  },
  {
    group: "Slate Tiles",
    keyword: "Old slate roof tiles",
    avg: 70,
    h: [12, 8, 12, 12, 11, 8],
  },
  {
    group: "Slate Tiles",
    keyword: "Salvaged Slate roof Tiles",
    avg: 260,
    h: [3, 3, 3, 3, 3, 3],
  },
  {
    group: "Slate Tiles",
    keyword: "Slate tiles reclaimed",
    avg: 70,
    h: [11, 12, 15, 16, 15, 15],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Purple Roofing Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Purple Roof Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Blue Roofing Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Blue Roof Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Green Roofing Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Green Roof Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Welsh Roof Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Welsh Roofing Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Random Roof Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Random Roofing Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Diminishing Roof Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Diminishing Roofing Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Swithland Roof Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Burlington Roof Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },
  {
    group: "Slate Tiles",
    keyword: "Reclaimed Westmorland Roof Slate",
    avg: null,
    h: [null, null, null, null, null, null],
  },

  // ── Pan Tiles ────────────────────────────────────────────────────────────────
  {
    group: "Pan Tiles",
    keyword: "old pan tiles",
    avg: 10,
    h: [10, 7, 10, 6, 13, 6],
  },
  {
    group: "Pan Tiles",
    keyword: "old pan tile",
    avg: null,
    h: [7, 11, 11, 11, 11, 11],
  },
  {
    group: "Pan Tiles",
    keyword: "concrete pan tile",
    avg: null,
    h: [31, 0, 34, 23, 25, 24],
  },
  {
    group: "Pan Tiles",
    keyword: "concrete pan tiles",
    avg: 210,
    h: [16, 18, 16, 19, 19, 18],
  },
  {
    group: "Pan Tiles",
    keyword: "old clay pan tiles",
    avg: null,
    h: [15, 16, 15, 15, 14, 15],
  },
  {
    group: "Pan Tiles",
    keyword: "old clay pan tile",
    avg: null,
    h: [12, 20, 13, 11, 15, 17],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed clay pan tile",
    avg: null,
    h: [10, 4, 10, 9, 10, 11],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed clay pan tiles",
    avg: null,
    h: [7, 8, 10, 9, 8, 10],
  },
  {
    group: "Pan Tiles",
    keyword: "Victorian pan tile",
    avg: null,
    h: [0, 0, 46, 0, 0, 0],
  },
  {
    group: "Pan Tiles",
    keyword: "victorian pan tiles",
    avg: 10,
    h: [23, 25, 23, 21, 28, 36],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed blue pan tiles",
    avg: null,
    h: [7, 6, 2, 2, 3, 5],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed blue pan tile",
    avg: null,
    h: [5, 5, 4, 5, 4, 5],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed red pan tile",
    avg: null,
    h: [5, 4, 11, 11, 11, 23],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed red pan tiles",
    avg: null,
    h: [5, 4, 5, 4, 10, 9],
  },
  {
    group: "Pan Tiles",
    keyword: "Marley Marquis pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "Marley Marquess pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "Reclaimed staffordshire blue pan tile",
    avg: null,
    h: [4, 4, 4, 4, 6, 5],
  },
  {
    group: "Pan Tiles",
    keyword: "Reclaimed staffordshire blue pan tiles",
    avg: null,
    h: [4, 4, 3, 4, 3, 3],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed terracotta pan tiles",
    avg: null,
    h: [5, 4, 6, 7, 6, 9],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed terracotta pan tile",
    avg: null,
    h: [7, 7, 7, 7, 9, 6],
  },
  {
    group: "Pan Tiles",
    keyword: "marley pan tiles",
    avg: 110,
    h: [16, 16, 16, 16, 16, 17],
  },
  {
    group: "Pan Tiles",
    keyword: "marley pan tile",
    avg: null,
    h: [17, 15, 17, 15, 16, 14],
  },
  {
    group: "Pan Tiles",
    keyword: "redland pan tiles",
    avg: 50,
    h: [22, 23, 22, 23, 14, 14],
  },
  {
    group: "Pan Tiles",
    keyword: "redland pan tile",
    avg: null,
    h: [11, 12, 12, 12, 14, 15],
  },
  {
    group: "Pan Tiles",
    keyword: "russell pan tile",
    avg: null,
    h: [4, 6, 4, 6, 3, 7],
  },
  {
    group: "Pan Tiles",
    keyword: "russell pan tiles",
    avg: null,
    h: [3, 3, 3, 6, 4, 2],
  },
  {
    group: "Pan Tiles",
    keyword: "sandtoft pan tiles",
    avg: 30,
    h: [40, 31, 35, 37, 50, 35],
  },
  {
    group: "Pan Tiles",
    keyword: "sandtoft pan tile",
    avg: null,
    h: [34, 31, 34, 31, 37, 35],
  },
  {
    group: "Pan Tiles",
    keyword: "marley reclaimed pan tiles",
    avg: null,
    h: [3, 3, 3, 4, 3, 3],
  },
  {
    group: "Pan Tiles",
    keyword: "marley reclaimed pan tile",
    avg: null,
    h: [3, 3, 3, 3, 3, 12],
  },
  {
    group: "Pan Tiles",
    keyword: "redland reclaimed pan tiles",
    avg: null,
    h: [3, 3, 3, 3, 3, 3],
  },
  {
    group: "Pan Tiles",
    keyword: "redland reclaimed pan tile",
    avg: null,
    h: [3, 3, 3, 3, 4, 3],
  },
  {
    group: "Pan Tiles",
    keyword: "russell reclaimed pan tile",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "russell reclaimed pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "sandtoft reclaimed pan tiles",
    avg: null,
    h: [1, 7, 6, 7, 3, 7],
  },
  {
    group: "Pan Tiles",
    keyword: "sandtoft reclaimed pan tile",
    avg: null,
    h: [3, 3, 3, 3, 3, 3],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed belgium pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed belgian pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 2],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed double roman pan tile",
    avg: null,
    h: [17, 17, 17, 15, 14, 12],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed single roll pan tile",
    avg: null,
    h: [1, 3, 3, 4, 3, 2],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed single wave pan tile",
    avg: null,
    h: [1, 1, 1, 2, 1, 4],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed old english pan tile",
    avg: null,
    h: [3, 3, 4, 4, 3, 2],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed bold roll pan tile",
    avg: null,
    h: [2, 3, 3, 3, 3, 3],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed forticrete pan tile",
    avg: null,
    h: [2, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed anchor pan tile",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "Marley bolled rolled pan tiles",
    avg: null,
    h: [4, 4, 4, 4, 4, 4],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Anchor bolled rolled pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Redland regent pan tiles",
    avg: null,
    h: [9, 9, 8, 9, 3, 16],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Redland saxon pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 2, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Redland 50 pan tiles",
    avg: null,
    h: [15, 20, 21, 17, 21, 20],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Marley double roman pan tiles",
    avg: null,
    h: [34, 26, 34, 27, 26, 25],
  },
  {
    group: "Pan Tiles",
    keyword: "Marley malvern pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Marley mendip pan tiles",
    avg: null,
    h: [50, 0, 50, 0, 25, 0],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Redland grovebury pan tiles",
    avg: null,
    h: [5, 37, 5, 39, 23, 20],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Marley Anglia pan tiles",
    avg: null,
    h: [19, 17, 20, 21, 23, 16],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Redland 52 pan tiles",
    avg: null,
    h: [7, 4, 15, 15, 11, 10],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Redland Norfolk pan tiles",
    avg: null,
    h: [10, 11, 10, 12, 12, 12],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Marley Ludlow plus pan tiles",
    avg: null,
    h: [23, 23, 23, 22, 30, 24],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Redland 49 pan tiles",
    avg: null,
    h: [18, 16, 18, 17, 20, 22],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Marley Ludlow major pan tiles",
    avg: null,
    h: [22, 22, 22, 22, 27, 25],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Redland renown pan tiles",
    avg: null,
    h: [14, 5, 14, 14, 16, 17],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Marley modern pan tiles",
    avg: 10,
    h: [15, 14, 15, 15, 14, 13],
  },
  {
    group: "Pan Tiles",
    keyword: "Marley monarch pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "Redland stone wold mark 1 /mark 2 pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Russell Grampian pan tiles",
    avg: null,
    h: [3, 3, 3, 3, 4, 2],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Russell Derwent pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Danum slate pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "reclaimed Marley Wessex pan tiles",
    avg: null,
    h: [18, 12, 18, 14, 20, 19],
  },
  {
    group: "Pan Tiles",
    keyword: "Redland delta pan tiles",
    avg: null,
    h: [7, 5, 12, 5, 7, 7],
  },
  {
    group: "Pan Tiles",
    keyword: "Redland Richmond pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "Hard row pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 7, 4],
  },
  {
    group: "Pan Tiles",
    keyword: "Hardrow hip tiles",
    avg: null,
    h: [3, 3, 3, 3, 3, 3],
  },
  {
    group: "Pan Tiles",
    keyword: "Clay bridge water pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "monarch pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Pan Tiles",
    keyword: "marquis pan tiles",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },

  // ── Chimney Pots ─────────────────────────────────────────────────────────────
  {
    group: "Chimney Pots",
    keyword: "antique chimney pot",
    avg: 390,
    h: [11, 11, 11, 13, 11, 11],
  },
  {
    group: "Chimney Pots",
    keyword: "antique terracotta chimney pot",
    avg: null,
    h: [7, 10, 9, 8, 2, 4],
  },
  {
    group: "Chimney Pots",
    keyword: "reclaimed chimney pot",
    avg: 320,
    h: [7, 12, 10, 10, 10, 10],
  },
  {
    group: "Chimney Pots",
    keyword: "antique clay chimney pot",
    avg: 10,
    h: [6, 30, 12, 9, 9, 9],
  },
  {
    group: "Chimney Pots",
    keyword: "antique chimney pot cowl",
    avg: null,
    h: [4, 3, 6, 10, 11, 11],
  },
  {
    group: "Chimney Pots",
    keyword: "Old Chimney Pot",
    avg: 320,
    h: [12, 13, 11, 12, 10, 10],
  },
  {
    group: "Chimney Pots",
    keyword: "Victorian Chimney Pot",
    avg: 320,
    h: [17, 12, 17, 17, 15, 16],
  },

  // ── Garden Assorted ──────────────────────────────────────────────────────────
  {
    group: "Garden Assorted",
    keyword: "antique cast iron lamppost",
    avg: 20,
    h: [16, 19, 16, 21, 44, 33],
  },
  {
    group: "Garden Assorted",
    keyword: "antique garden roller",
    avg: 90,
    h: [10, 6, 10, 10, 13, 12],
  },
  {
    group: "Garden Assorted",
    keyword: "antique stone birdbath",
    avg: 10,
    h: [18, 16, 18, 30, 32, 36],
  },
  {
    group: "Garden Assorted",
    keyword: "antique driveway gates",
    avg: null,
    h: [0, 0, 50, 0, 0, 39],
  },
  {
    group: "Garden Assorted",
    keyword: "antique garden urns",
    avg: 50,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Garden Assorted",
    keyword: "reclaimed garden urns",
    avg: 10,
    h: [17, 15, 20, 15, 21, 17],
  },
  {
    group: "Garden Assorted",
    keyword: "Antique pedestrian gate",
    avg: null,
    h: [12, 16, 12, 16, 10, 16],
  },

  // ── Brick Slips ──────────────────────────────────────────────────────────────
  {
    group: "Brick Slips",
    keyword: "brick slips",
    avg: 2710,
    h: [0, 0, 0, 0, 40, 38],
  },
  {
    group: "Brick Slips",
    keyword: "buy brick slips",
    avg: 90,
    h: [20, 19, 18, 17, 19, 18],
  },
  {
    group: "Brick Slips",
    keyword: "rustic brick slips",
    avg: 210,
    h: [39, 38, 41, 41, 31, 17],
  },
  {
    group: "Brick Slips",
    keyword: "slim brick tiles",
    avg: 30,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Brick Slips",
    keyword: "Old Brick Slips",
    avg: null,
    h: [14, 12, 14, 13, 15, 11],
  },
  {
    group: "Brick Slips",
    keyword: "reclaimed brick brick slips",
    avg: null,
    h: [13, 14, 13, 13, 13, 10],
  },
  {
    group: "Brick Slips",
    keyword: "old brick brick slips",
    avg: null,
    h: [12, 14, 21, 13, 12, 11],
  },
  {
    group: "Brick Slips",
    keyword: "bespoke brick slips",
    avg: null,
    h: [10, 33, 10, 16, 13, 19],
  },
  {
    group: "Brick Slips",
    keyword: "Brick Cutting",
    avg: null,
    h: [null, null, null, null, 0, 0],
  },
  {
    group: "Brick Slips",
    keyword: "Brick Slip Cutting",
    avg: null,
    h: [null, null, null, null, 0, 0],
  },
  {
    group: "Brick Slips",
    keyword: "Bespoke Brick Slip Cutting",
    avg: null,
    h: [null, null, null, null, 10, 10],
  },
  {
    group: "Brick Slips",
    keyword: "Real Brick Tiles",
    avg: null,
    h: [null, null, null, null, 0, 0],
  },
  {
    group: "Brick Slips",
    keyword: "Brick Tiles",
    avg: null,
    h: [null, null, null, null, 0, 0],
  },
  {
    group: "Brick Slips",
    keyword: "Old Brick Wall Tiles",
    avg: null,
    h: [null, null, null, null, 23, 25],
  },

  // ── Plinth Bricks ────────────────────────────────────────────────────────────
  {
    group: "Plinth Bricks",
    keyword: "reclaimed plinth bricks",
    avg: 30,
    h: [7, 4, 2, 2, 2, 2],
  },

  // ── Rustic Bricks ────────────────────────────────────────────────────────────
  {
    group: "Rustic Bricks",
    keyword: "reclaimed rustic bricks",
    avg: 10,
    h: [15, 9, 2, 3, 5, 7],
  },
  {
    group: "Rustic Bricks",
    keyword: "antique rustic bricks",
    avg: 110,
    h: [0, 0, 0, 0, 0, 0],
  },

  // ── Wirecut Bricks ───────────────────────────────────────────────────────────
  {
    group: "Wirecut Bricks",
    keyword: "reclaimed wirecut bricks",
    avg: 20,
    h: [4, 4, 2, 4, 3, 2],
  },
  {
    group: "Wirecut Bricks",
    keyword: "antique wirecut bricks",
    avg: null,
    h: [2, 2, 4, 2, 3, 5],
  },
  {
    group: "Wirecut Bricks",
    keyword: "old victorian wirecut bricks",
    avg: null,
    h: [0, 25, 23, 23, 21, 21],
  },

  // ── Bricks Generic ───────────────────────────────────────────────────────────
  {
    group: "Bricks Generic",
    keyword: "reclaimed bricks",
    avg: 4400,
    h: [16, 11, 16, 16, 23, 22],
  },
  {
    group: "Bricks Generic",
    keyword: "antique bricks",
    avg: 140,
    h: [4, 42, 9, 36, 8, 24],
  },
  {
    group: "Bricks Generic",
    keyword: "antique house bricks",
    avg: 10,
    h: [0, 0, 0, 0, 0, 8],
  },
  {
    group: "Bricks Generic",
    keyword: "bricks to match my house",
    avg: 10,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Bricks Generic",
    keyword: "bricks to match my old house",
    avg: null,
    h: [0, 0, 0, 0, 52, 0],
  },
  {
    group: "Bricks Generic",
    keyword: "bricks to match my victorian house",
    avg: null,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Bricks Generic",
    keyword: "farmhouse bricks",
    avg: 90,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Bricks Generic",
    keyword: "reclaimed glazed brick",
    avg: null,
    h: [3, 3, 10, 10, 10, 9],
  },
  {
    group: "Bricks Generic",
    keyword: "reclaimed yellow stock brick",
    avg: 10,
    h: [17, 12, 20, 16, 17, 21],
  },
  {
    group: "Bricks Generic",
    keyword: "buy reclaimed bricks",
    avg: null,
    h: [9, 15, 13, 25, 9, 11],
  },

  // ── New Handmade Bricks ──────────────────────────────────────────────────────
  {
    group: "New Handmade Bricks",
    keyword: "Cant bricks",
    avg: 320,
    h: [14, 13, 10, 13, 13, 13],
  },
  {
    group: "New Handmade Bricks",
    keyword: "squint bricks",
    avg: 590,
    h: [20, 21, 20, 20, 21, 20],
  },
  {
    group: "New Handmade Bricks",
    keyword: "bullnose bricks",
    avg: 880,
    h: [23, 34, 22, 28, 35, 26],
  },

  // ── Reclaimed Handmade Bricks ────────────────────────────────────────────────
  {
    group: "Reclaimed Handmade Bricks",
    keyword: "Reclaimed Handmade Bricks",
    avg: 30,
    h: [20, 16, 22, 10, 19, 16],
  },
  {
    group: "Reclaimed Handmade Bricks",
    keyword: "victorian handmade bricks",
    avg: null,
    h: [44, 10, 22, 19, 18, 18],
  },
  {
    group: "Reclaimed Handmade Bricks",
    keyword: "buy old handmade house bricks",
    avg: null,
    h: [18, 17, 18, 16, 13, 12],
  },

  // ── Decorative & Corbelling Bricks ──────────────────────────────────────────
  {
    group: "Decorative & Corbelling Bricks",
    keyword: "antique corbel brick",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Decorative & Corbelling Bricks",
    keyword: "Rustic Bricks",
    avg: null,
    h: [30, 32, 26, 27, 30, 29],
  },

  // ── Pavers ───────────────────────────────────────────────────────────────────
  {
    group: "Pavers",
    keyword: "victorian pavers",
    avg: 90,
    h: [24, 25, 43, 25, 24, 25],
  },
  {
    group: "Pavers",
    keyword: "staffordshire blue pavers",
    avg: 170,
    h: [18, 14, 14, 14, 14, 13],
  },
  {
    group: "Pavers",
    keyword: "patterned antique pavers",
    avg: null,
    h: [10, 9, 14, 20, 23, 21],
  },
  {
    group: "Pavers",
    keyword: "reclaimed paving bricks",
    avg: 260,
    h: [11, 12, 10, 5, 13, 11],
  },
  {
    group: "Pavers",
    keyword: "victorian paving bricks",
    avg: 40,
    h: [14, 26, 14, 24, 18, 14],
  },
  {
    group: "Pavers",
    keyword: "Reclaimed diamond pavers",
    avg: null,
    h: [6, 5, 5, 5, 11, 11],
  },
  {
    group: "Pavers",
    keyword: "reclaimed diamond paving",
    avg: null,
    h: [8, 7, 13, 5, 10, 10],
  },
  {
    group: "Pavers",
    keyword: "reclaimed clay pavers",
    avg: null,
    h: [7, 12, 12, 14, 12, 10],
  },
  {
    group: "Pavers",
    keyword: "reclaimed clay pavers for sale",
    avg: 10,
    h: [8, 7, 7, 9, 9, 8],
  },
  {
    group: "Pavers",
    keyword: "victorian paving slabs",
    avg: 990,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Pavers",
    keyword: "recycled brick pavers",
    avg: 20,
    h: [8, 10, 8, 10, 6, 10],
  },

  // ── Walling, Kerbing & Building Stone ────────────────────────────────────────
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "antique stone walling",
    avg: null,
    h: [19, 19, 20, 18, 18, 21],
  },
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "victorian stone walling",
    avg: null,
    h: [41, 0, 0, 0, 0, 0],
  },
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "antique stone kerb",
    avg: null,
    h: [10, 12, 18, 10, 19, 20],
  },
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "antique stone kerbing",
    avg: null,
    h: [8, 8, 19, 8, 15, 17],
  },
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "Reclaimed stone kerb",
    avg: null,
    h: [18, 20, 16, 20, 18, 16],
  },
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "reclaimed stone kerbing",
    avg: null,
    h: [12, 10, 11, 9, 17, 17],
  },
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "old granite kerbs",
    avg: 10,
    h: [9, 9, 11, 7, 19, 19],
  },
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "reclaimed granite kerbs",
    avg: 30,
    h: [16, 18, 22, 23, 17, 16],
  },
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "reclaimed granite kerbstones",
    avg: 20,
    h: [7, 8, 7, 7, 10, 20],
  },
  {
    group: "Walling, Kerbing & Building Stone",
    keyword: "victorian coping stones",
    avg: 140,
    h: [18, 15, 16, 19, 16, 14],
  },

  // ── Pier Caps ────────────────────────────────────────────────────────────────
  {
    group: "Pier Caps",
    keyword: "antique pier caps",
    avg: 10,
    h: [18, 21, 21, 21, 18, 18],
  },
  {
    group: "Pier Caps",
    keyword: "antique pier cappings",
    avg: null,
    h: [18, 20, 21, 19, 14, 16],
  },
  {
    group: "Pier Caps",
    keyword: "antique stone pier caps",
    avg: null,
    h: [5, 4, 7, 6, 7, 11],
  },
  {
    group: "Pier Caps",
    keyword: "antique stone pier cappings",
    avg: null,
    h: [5, 10, 11, 11, 19, 5],
  },
  {
    group: "Pier Caps",
    keyword: "Victorian pillar caps",
    avg: null,
    h: [34, 20, 32, 35, 20, 28],
  },
  {
    group: "Pier Caps",
    keyword: "reclaimed stone pier caps",
    avg: 50,
    h: [4, 4, 4, 4, 3, 4],
  },
  {
    group: "Pier Caps",
    keyword: "reclaimed stone pillar caps",
    avg: 10,
    h: [6, 4, 7, 7, 4, 3],
  },

  // ── Wall Coppings ────────────────────────────────────────────────────────────
  {
    group: "Wall Coppings",
    keyword: "antique stone copping",
    avg: null,
    h: [19, 19, 19, 19, 17, 20],
  },
  {
    group: "Wall Coppings",
    keyword: "antique wall copping",
    avg: null,
    h: [12, 13, 18, 16, 16, 15],
  },
  {
    group: "Wall Coppings",
    keyword: "antique copping stones",
    avg: null,
    h: [16, 16, 17, 19, 16, 12],
  },
  {
    group: "Wall Coppings",
    keyword: "victorian copping stones",
    avg: null,
    h: [12, 12, 18, 18, 19, 18],
  },
  {
    group: "Wall Coppings",
    keyword: "victorian wall copping stones",
    avg: null,
    h: [15, 14, 16, 15, 18, 17],
  },

  // ── Garden (stone) ───────────────────────────────────────────────────────────
  {
    group: "Garden Stone",
    keyword: "antique garden stone edgers",
    avg: null,
    h: [46, 19, 9, 8, 10, 8],
  },
  {
    group: "Garden Stone",
    keyword: "antique stone garden borders",
    avg: null,
    h: [7, 7, 6, 9, 14, 15],
  },

  // ── Flagstone Paving ─────────────────────────────────────────────────────────
  {
    group: "Flagstone Paving",
    keyword: "antique flag stones",
    avg: 10,
    h: [31, 34, 32, 31, 32, 31],
  },
  {
    group: "Flagstone Paving",
    keyword: "victorian flag stones",
    avg: null,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Flagstone Paving",
    keyword: "antique flagstone paving",
    avg: null,
    h: [16, 15, 17, 0, 21, 22],
  },

  // ── Quarry Tiles ─────────────────────────────────────────────────────────────
  {
    group: "Quarry Tiles",
    keyword: "antique quarry tiles",
    avg: 20,
    h: [4, 10, 14, 11, 12, 13],
  },
  {
    group: "Quarry Tiles",
    keyword: "reclaimed quarry tiles",
    avg: null,
    h: [9, 6, 9, 9, 7, 9],
  },
  {
    group: "Quarry Tiles",
    keyword: "genuine victorian quarry tiles",
    avg: 480,
    h: [16, 15, 17, 14, 17, 18],
  },
  {
    group: "Quarry Tiles",
    keyword: "antique terracotta tiles",
    avg: 40,
    h: [0, 0, 0, 0, 45, 0],
  },

  // ── Timeless Stone ───────────────────────────────────────────────────────────
  {
    group: "Timeless Stone",
    keyword: "Exeter Timeless Stone",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Timeless Stone",
    keyword: "Hamilton Timeless Stone",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Timeless Stone",
    keyword: "Southwell Timeless Stone",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Timeless Stone",
    keyword: "Ludlow Timeless Stone",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Timeless Stone",
    keyword: "Cheltenham Timeless Stone",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Timeless Stone",
    keyword: "Goodwood Timeless Stone",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Timeless Stone",
    keyword: "Chepstow Timeless Stone",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Timeless Stone",
    keyword: "Kelos Timeless Stone",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Timeless Stone",
    keyword: "Wetherby Timeless Stone",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Timeless Stone",
    keyword: "Newbury Timeless Stone",
    avg: null,
    h: [1, 1, 1, 1, 1, 1],
  },
  {
    group: "Timeless Stone",
    keyword: "Epsom Timeless Stone",
    avg: null,
    h: [1, 1, 1, 1, 4, 1],
  },
  {
    group: "Timeless Stone",
    keyword: "Sandown Timeless Stone",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },
  {
    group: "Timeless Stone",
    keyword: "Timeless Stone Collection",
    avg: null,
    h: [2, 2, 2, 2, 2, 2],
  },

  // ── Fireplace ────────────────────────────────────────────────────────────────
  {
    group: "Fireplace",
    keyword: "cast iron fireplace",
    avg: 3600,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Fireplace",
    keyword: "antique cast iron fireplace",
    avg: 390,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Fireplace",
    keyword: "victorian cast iron fireplace",
    avg: 720,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Fireplace",
    keyword: "victorian metal fireplace",
    avg: 10,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Fireplace",
    keyword: "antique cast iron bedroom fireplace",
    avg: 10,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Fireplace",
    keyword: "antique victorian cast iron fireplaces",
    avg: 10,
    h: [0, 0, 0, 0, 0, 0],
  },

  // ── Air Bricks & Air Vents ───────────────────────────────────────────────────
  {
    group: "Air Bricks & Air Vents",
    keyword: "victorian air brick",
    avg: 110,
    h: [0, 0, 40, 32, 32, 35],
  },
  {
    group: "Air Bricks & Air Vents",
    keyword: "victorian air vents",
    avg: 20,
    h: [0, 0, 0, 0, 0, 0],
  },

  // ── Reclaimed Floorboards ────────────────────────────────────────────────────
  {
    group: "Reclaimed Floorboards",
    keyword: "Reclaimed floorboards",
    avg: 1900,
    h: [23, 17, 22, 20, 25, 23],
  },
  {
    group: "Reclaimed Floorboards",
    keyword: "antique floorboards",
    avg: null,
    h: [46, 48, 0, 36, 0, 0],
  },
  {
    group: "Reclaimed Floorboards",
    keyword: "victorian floorboards",
    avg: 210,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Reclaimed Floorboards",
    keyword: "old floorboards",
    avg: 210,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Reclaimed Floorboards",
    keyword: "antique wooden flooring",
    avg: 140,
    h: [0, 0, 0, 0, 53, 0],
  },

  // ── Fireplace Beams ──────────────────────────────────────────────────────────
  {
    group: "Fireplace Beams",
    keyword: "antique fireplace beams",
    avg: null,
    h: [28, 0, 35, 0, 33, 36],
  },
  {
    group: "Fireplace Beams",
    keyword: "victorian fireplace beams",
    avg: null,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Fireplace Beams",
    keyword: "antique oak beam",
    avg: 10,
    h: [52, 0, 0, 35, 26, 27],
  },
  {
    group: "Fireplace Beams",
    keyword: "antique wooden beams",
    avg: 90,
    h: [15, 15, 17, 29, 17, 24],
  },
  {
    group: "Fireplace Beams",
    keyword: "wood cover for RSJ beam",
    avg: null,
    h: [14, 14, 14, 14, 20, 18],
  },
  {
    group: "Fireplace Beams",
    keyword: "rsj covers made from wood",
    avg: null,
    h: [10, 9, 13, 12, 11, 11],
  },
  {
    group: "Fireplace Beams",
    keyword: "wood rsj covers",
    avg: null,
    h: [14, 12, 13, 12, 17, 16],
  },
  {
    group: "Fireplace Beams",
    keyword: "rsj oak beam covers",
    avg: null,
    h: [12, 12, 17, 17, 15, 16],
  },
  {
    group: "Fireplace Beams",
    keyword: "Oak rsj cover",
    avg: null,
    h: [16, 16, 16, 18, 18, 19],
  },
  {
    group: "Fireplace Beams",
    keyword: "fake oak rsj covers",
    avg: null,
    h: [13, 12, 13, 15, 14, 15],
  },
  {
    group: "Fireplace Beams",
    keyword: "oak beam cladding rsj",
    avg: null,
    h: [13, 12, 12, 10, 9, 8],
  },
  {
    group: "Fireplace Beams",
    keyword: "oak rsj cladding",
    avg: null,
    h: [13, 14, 13, 12, 13, 13],
  },

  // ── Cobbles ──────────────────────────────────────────────────────────────────
  {
    group: "Cobbles",
    keyword: "antique cobbles",
    avg: 110,
    h: [15, 14, 17, 16, 15, 16],
  },
  {
    group: "Cobbles",
    keyword: "antique granite setts",
    avg: null,
    h: [6, 14, 14, 14, 19, 14],
  },
  {
    group: "Cobbles",
    keyword: "reclaimed cobbles",
    avg: 480,
    h: [17, 22, 17, 18, 35, 25],
  },
  {
    group: "Cobbles",
    keyword: "Victorian Cobble Stones",
    avg: null,
    h: [6, 5, 7, 5, 10, 14],
  },
  {
    group: "Cobbles",
    keyword: "Antique Cobble Stones",
    avg: null,
    h: [13, 14, 14, 17, 13, 13],
  },
  {
    group: "Cobbles",
    keyword: "Reclaimed Cobble Stones",
    avg: null,
    h: [14, 15, 18, 17, 20, 17],
  },
  {
    group: "Cobbles",
    keyword: "Cobblestones",
    avg: null,
    h: [0, 0, 0, 0, 22, 0],
  },
  {
    group: "Cobbles",
    keyword: "Granite Cobblestones",
    avg: null,
    h: [0, 28, 0, 28, 30, 26],
  },
  {
    group: "Cobbles",
    keyword: "Granite Setts",
    avg: null,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Cobbles",
    keyword: "Granite Cobbles",
    avg: null,
    h: [0, 16, 47, 18, 41, 22],
  },
  {
    group: "Cobbles",
    keyword: "Reclaimed Cobblestones",
    avg: null,
    h: [17, 0, 18, 0, 21, 45],
  },
  {
    group: "Cobbles",
    keyword: "Reclaimed Cobblestones for Sale",
    avg: null,
    h: [14, 14, 22, 18, 18, 17],
  },
  {
    group: "Cobbles",
    keyword: "Reclaimed Granite Setts",
    avg: null,
    h: [15, 25, 17, 20, 18, 18],
  },

  // ── Railway Sleepers ─────────────────────────────────────────────────────────
  {
    group: "Railway Sleepers",
    keyword: "railway sleepers",
    avg: 27100,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Railway Sleepers",
    keyword: "old railway sleepers",
    avg: null,
    h: [0, 0, 0, 0, 21, 32],
  },
  {
    group: "Railway Sleepers",
    keyword: "wooden sleepers for garden",
    avg: 1300,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Railway Sleepers",
    keyword: "new railway sleepers",
    avg: 210,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Railway Sleepers",
    keyword: "oak railway sleepers",
    avg: 6600,
    h: [0, 0, 0, 0, 0, 0],
  },

  // ── Misc ─────────────────────────────────────────────────────────────────────
  {
    group: "Misc",
    keyword: "cast iron bath",
    avg: 1600,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Misc",
    keyword: "antique cast iron bath",
    avg: 90,
    h: [57, 0, 48, 0, 47, 0],
  },
  {
    group: "Misc",
    keyword: "antique cast iron bath tub",
    avg: 10,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Misc",
    keyword: "victorian cast iron bath tub",
    avg: 10,
    h: [0, 0, 0, 0, 0, 0],
  },
  {
    group: "Misc",
    keyword: "victorian cast iron bath",
    avg: 50,
    h: [0, 0, 0, 0, 0, 0],
  },
];

// ─── Date headers ────────────────────────────────────────────────────────────
const dates = ["2026-01-27", "2026-02-02", "2026-02-16"];

// ─── Build keywords.json ─────────────────────────────────────────────────────
const keywords = data.map(({ group, keyword, avg }) => ({
  group,
  keyword,
  avg_monthly_searches: avg ?? 0,
}));

writeFileSync(
  resolve(ROOT, "keywords.json"),
  JSON.stringify(keywords, null, 2),
);
console.log(`[keywords.json] Written ${keywords.length} keywords`);

// ─── Build seed CSV ──────────────────────────────────────────────────────────
const baseHeaders = ["Group", "Keyword", "Avg Monthly Searches"];
const dateHeaders = dates.flatMap((d) => [`${d} Mobile`, `${d} Desktop`]);
const allHeaders = [...baseHeaders, ...dateHeaders];

const rows = data.map(({ group, keyword, avg, h }) => {
  const row = {
    Group: group,
    Keyword: keyword,
    "Avg Monthly Searches": avg ?? "",
  };
  dates.forEach((d, i) => {
    const m = h[i * 2];
    const desk = h[i * 2 + 1];
    row[`${d} Mobile`] = m == null ? "" : m;
    row[`${d} Desktop`] = desk == null ? "" : desk;
  });
  return row;
});

if (!existsSync(resolve(ROOT, "data"))) mkdirSync(resolve(ROOT, "data"));

const writer = createObjectCsvWriter({
  path: resolve(ROOT, "data/rankings.csv"),
  header: allHeaders.map((id) => ({ id, title: id })),
});

await writer.writeRecords(rows);
console.log(
  `[data/rankings.csv] Written seed with ${rows.length} rows × ${allHeaders.length} columns`,
);
console.log(`[Done] Run "node src/index.js" to append this week's data`);
