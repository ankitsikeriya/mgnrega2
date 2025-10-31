import fs from "node:fs";
import path from "node:path";

let cache = null;
let cacheMtime = 0;

function normalizeKey(s) {
  return String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function detect(columns) {
  const idx = {};
  const canon = (s) => normalizeKey(s);
  const n = columns.map((c) => canon(c));
  const pick = (...alts) => {
    for (const a of alts) {
      const i = n.indexOf(canon(a));
      if (i !== -1) return i;
    }
    return -1;
  };
  idx.state = pick("state_name", "state");
  idx.district = pick("district_name", "district");
  idx.hh = pick("total_households_worked", "households_worked", "total_households", "hh_worked");
  idx.wages = pick("total_wages_disbursed", "wages_disbursed", "wages");
  idx.pdays = pick(
    "total_persondays",
    "persondays",
    "person_days",
    "total_person_days",
    "persondays_of_central_liability_so_far"
  );
  idx.avg = pick(
    "avg_days_employment",
    "average_days_employment",
    "avg_days",
    "average_days_of_employment_provided_per_household"
  );
  return idx;
}

function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;
  let row = [];
  let field = "";
  let inQuotes = false;
  while (i < len) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    if (ch === '\r') { i++; continue; }
    field += ch;
    i++;
  }
  row.push(field);
  rows.push(row);
  return rows;
}

function loadCSVFile(csvPath) {
  const abs = path.isAbsolute(csvPath) ? csvPath : path.join(process.cwd(), csvPath);
  if (!fs.existsSync(abs)) return null;
  const stat = fs.statSync(abs);
  if (cache && cacheMtime === stat.mtimeMs) return cache;
  const text = fs.readFileSync(abs, "utf8");
  const rows = parseCSV(text);
  if (!rows.length) return null;
  const headers = rows[0];
  const idx = detect(headers);
  const map = new Map();
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    const state = normalizeKey(cols[idx.state]);
    const district = normalizeKey(cols[idx.district]);
    if (!state || !district) continue;
    const key = state + "|" + district;
    const next = {
      totalHouseholdsWorked: Number(cols[idx.hh] ?? 0) || 0,
      wagesDisbursed: Number(cols[idx.wages] ?? 0) || 0,
      totalPersonDays: Number(cols[idx.pdays] ?? 0) || 0,
      averageDaysEmployment: Number(cols[idx.avg] ?? 0) || 0,
    };
    const prev = map.get(key);
    if (!prev) {
      map.set(key, next);
    } else {
      map.set(key, {
        totalHouseholdsWorked: (prev.totalHouseholdsWorked || 0) + (next.totalHouseholdsWorked || 0),
        wagesDisbursed: (prev.wagesDisbursed || 0) + (next.wagesDisbursed || 0),
        totalPersonDays: (prev.totalPersonDays || 0) + (next.totalPersonDays || 0),
        averageDaysEmployment: Math.max(prev.averageDaysEmployment || 0, next.averageDaysEmployment || 0),
      });
    }
  }
  cache = { path: abs, map };
  cacheMtime = stat.mtimeMs;
  return cache;
}

export function getMetricsFromCSV(state, district) {
  const csvPath = process.env.CSV_PATH || "data/mp_mgnrega.csv";
  const store = loadCSVFile(csvPath);
  if (!store) return null;
  const key = normalizeKey(state) + "|" + normalizeKey(district);
  return store.map.get(key) || null;
}

export function listDistrictsFromCSV(state) {
  // Delegate to robust scanner to preserve originals
  return listDistrictsRobust(state);
}

// Robust listing that ignores metric columns and scans the CSV directly
export function listDistrictsRobust(state) {
  const csvPath = process.env.CSV_PATH || "data/mp_mgnrega.csv";
  const abs = path.isAbsolute(csvPath) ? csvPath : path.join(process.cwd(), csvPath);
  if (!fs.existsSync(abs)) return [];
  try {
    const text = fs.readFileSync(abs, "utf8");
    const rows = parseCSV(text);
    if (!rows.length) return [];
    const headers = rows[0];
    const idx = detect(headers);
    if (idx.state === -1 || idx.district === -1) return [];
    const sKey = normalizeKey(state);
    const set = new Set();
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const s = normalizeKey(r[idx.state]);
      const originalD = String(r[idx.district] || "").trim();
      const d = normalizeKey(originalD);
      if (!s || !d) continue;
      if (s === sKey) set.add(originalD);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}
