import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { RaceResult } from "./src/types";

// DATA_DIR resolution order:
// 1. Explicit DATA_DIR env var (set this in Railway if you ever change the volume mount path)
// 2. /data if it exists (Railway persistent volume mount used by this project)
// 3. Fallback to cwd for local/AI Studio dev where no volume is mounted
const DATA_DIR = process.env.DATA_DIR || (fs.existsSync("/data") ? "/data" : process.cwd());
const CSV_FILE_PATH = path.join(DATA_DIR, "racing_data.csv");
console.log(`Using CSV data path: ${CSV_FILE_PATH}`);
const CSV_HEADERS = "id,game,track,car_class,conditions,winner,fastest_lap,fastest_lap_time,date,laps,race_duration,harish_finishing_pos,shabesh_finishing_pos,harish_starting_pos,shabesh_starting_pos\n";

// Helper to sanitize fields to prevent CSV breakage
function sanitizeField(value: string): string {
  if (!value) return "";
  return value.replace(/,/g, " ").replace(/"/g, "").replace(/\n/g, " ").trim();
}

// Pre-seed some default competitive data if CSV doesn't exist
function ensureCSVExists() {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    // Safety net: if an old CSV exists at the previous default location
    // (process.cwd()) but not at the resolved DATA_DIR, migrate it instead
    // of creating a blank file. Prevents silent data loss if DATA_DIR ever
    // changes or the volume mount briefly isn't available on first boot.
    const legacyPath = path.join(process.cwd(), "racing_data.csv");
    if (legacyPath !== CSV_FILE_PATH && fs.existsSync(legacyPath)) {
      fs.copyFileSync(legacyPath, CSV_FILE_PATH);
      console.log(`Migrated existing CSV from ${legacyPath} to ${CSV_FILE_PATH}.`);
      return;
    }
    fs.writeFileSync(CSV_FILE_PATH, CSV_HEADERS, "utf-8");
    console.log(`Created empty racing_data.csv at ${CSV_FILE_PATH}.`);
  }
}

// Read and parse races from CSV
function readRacesFromCSV(): RaceResult[] {
  ensureCSVExists();
  try {
    const content = fs.readFileSync(CSV_FILE_PATH, "utf-8");
    const lines = content.split("\n").filter(line => line.trim() !== "");
    
    if (lines.length <= 1) return []; // Only headers or empty

    const races: RaceResult[] = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",");
      if (parts.length >= 9) {
        races.push({
          id: parts[0],
          game: parts[1] as any,
          track: parts[2],
          carClass: parts[3],
          conditions: parts[4] as any,
          winner: parts[5] as any,
          fastestLap: parts[6] as any,
          fastestLapTime: parts[7],
          date: parts[8],
          laps: parts[9] ? parseInt(parts[9], 10) : undefined,
          raceDuration: parts[10] || undefined,
          harishFinishingPos: parts[11] ? parseInt(parts[11], 10) : undefined,
          shabeshFinishingPos: parts[12] ? parseInt(parts[12], 10) : undefined,
          harishStartingPos: parts[13] ? parseInt(parts[13], 10) : undefined,
          shabeshStartingPos: parts[14] ? parseInt(parts[14], 10) : undefined
        });
      }
    }
    return races;
  } catch (error) {
    console.error("Error reading CSV:", error);
    return [];
  }
}

// Write races back to CSV
function writeRacesToCSV(races: RaceResult[]) {
  try {
    let content = CSV_HEADERS;
    races.forEach(r => {
      const lapsStr = r.laps !== undefined && !isNaN(r.laps) ? r.laps.toString() : "";
      const durationStr = r.raceDuration || "";
      const hFinPos = r.harishFinishingPos !== undefined && !isNaN(r.harishFinishingPos) ? r.harishFinishingPos.toString() : "";
      const sFinPos = r.shabeshFinishingPos !== undefined && !isNaN(r.shabeshFinishingPos) ? r.shabeshFinishingPos.toString() : "";
      const hStartPos = r.harishStartingPos !== undefined && !isNaN(r.harishStartingPos) ? r.harishStartingPos.toString() : "";
      const sStartPos = r.shabeshStartingPos !== undefined && !isNaN(r.shabeshStartingPos) ? r.shabeshStartingPos.toString() : "";
      
      content += `${r.id},${sanitizeField(r.game)},${sanitizeField(r.track)},${sanitizeField(r.carClass)},${sanitizeField(r.conditions)},${sanitizeField(r.winner)},${sanitizeField(r.fastestLap)},${sanitizeField(r.fastestLapTime)},${sanitizeField(r.date)},${lapsStr},${sanitizeField(durationStr)},${hFinPos},${sFinPos},${hStartPos},${sStartPos}\n`;
    });
    fs.writeFileSync(CSV_FILE_PATH, content, "utf-8");
  } catch (error) {
    console.error("Error writing CSV:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Endpoints
  app.get("/api/races", (req, res) => {
    const races = readRacesFromCSV();
    res.json(races);
  });

  app.post("/api/races", (req, res) => {
    const { 
      game, 
      track, 
      carClass, 
      conditions, 
      winner, 
      fastestLap, 
      fastestLapTime, 
      date, 
      laps, 
      raceDuration,
      harishFinishingPos,
      shabeshFinishingPos,
      harishStartingPos,
      shabeshStartingPos
    } = req.body;
    
    if (!game || !track || !winner || !fastestLap || !fastestLapTime || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRace: RaceResult = {
      id: "race_" + Date.now(),
      game,
      track,
      carClass: carClass || "Default Class",
      conditions: conditions || "Dry - Day",
      winner,
      fastestLap,
      fastestLapTime,
      date,
      laps: laps ? parseInt(laps, 10) : undefined,
      raceDuration: raceDuration || undefined,
      harishFinishingPos: harishFinishingPos !== undefined ? parseInt(harishFinishingPos, 10) : undefined,
      shabeshFinishingPos: shabeshFinishingPos !== undefined ? parseInt(shabeshFinishingPos, 10) : undefined,
      harishStartingPos: harishStartingPos !== undefined ? parseInt(harishStartingPos, 10) : undefined,
      shabeshStartingPos: shabeshStartingPos !== undefined ? parseInt(shabeshStartingPos, 10) : undefined
    };

    const races = readRacesFromCSV();
    races.push(newRace);
    writeRacesToCSV(races);

    res.status(201).json(races);
  });

  app.delete("/api/races/:id", (req, res) => {
    const { id } = req.params;
    let races = readRacesFromCSV();
    const initialLength = races.length;
    races = races.filter(r => r.id !== id);
    
    if (races.length === initialLength) {
      return res.status(404).json({ error: "Race result not found" });
    }
    
    writeRacesToCSV(races);
    res.json(races);
  });

  // Vite Integration for Assets and Dev Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
