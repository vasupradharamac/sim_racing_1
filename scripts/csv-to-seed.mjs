#!/usr/bin/env node
// Regenerates migrations/0002_seed_data.sql from a racing_data.csv export
// (e.g. one pulled fresh from the old Railway volume).
//
// Usage: node scripts/csv-to-seed.mjs path/to/racing_data.csv

import fs from "fs";
import path from "path";

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/csv-to-seed.mjs path/to/racing_data.csv");
  process.exit(1);
}

const content = fs.readFileSync(csvPath, "utf-8");
const lines = content.split("\n").filter((l) => l.trim() !== "");
const rows = lines.slice(1); // skip header

function esc(v) {
  if (v === undefined || v === null || v === "") return "NULL";
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function escInt(v) {
  if (v === undefined || v === null || v === "") return "NULL";
  const n = parseInt(v, 10);
  return isNaN(n) ? "NULL" : String(n);
}

let sql = `-- Seed data generated from ${path.basename(csvPath)} on ${new Date().toISOString().slice(0, 10)}.\n`;
sql += "-- Safe to re-run: uses INSERT OR IGNORE keyed on id.\n";

let count = 0;
for (const line of rows) {
  const p = line.split(",");
  if (p.length < 9) continue;
  const [
    id, game, track, carClass, conditions, winner, fastestLap, fastestLapTime, date,
    laps, raceDuration, harishFinishingPos, shabeshFinishingPos, harishStartingPos, shabeshStartingPos,
  ] = p;

  sql += `INSERT OR IGNORE INTO races (id, game, track, car_class, conditions, winner, fastest_lap, fastest_lap_time, date, laps, race_duration, harish_finishing_pos, shabesh_finishing_pos, harish_starting_pos, shabesh_starting_pos) VALUES (${esc(id)}, ${esc(game)}, ${esc(track)}, ${esc(carClass)}, ${esc(conditions)}, ${esc(winner)}, ${esc(fastestLap)}, ${esc(fastestLapTime)}, ${esc(date)}, ${escInt(laps)}, ${esc(raceDuration)}, ${esc(harishFinishingPos)}, ${esc(shabeshFinishingPos)}, ${escInt(harishStartingPos)}, ${escInt(shabeshStartingPos)});\n`;
  count++;
}

const outPath = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "migrations", "0002_seed_data.sql");
fs.writeFileSync(outPath, sql);
console.log(`Wrote ${count} rows to ${outPath}`);
