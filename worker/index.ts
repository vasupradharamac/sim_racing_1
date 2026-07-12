import { RaceResult } from "../src/types";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

interface RaceRow {
  id: string;
  game: string;
  track: string;
  car_class: string;
  conditions: string;
  winner: string;
  fastest_lap: string;
  fastest_lap_time: string;
  date: string;
  laps: number | null;
  race_duration: string | null;
  harish_finishing_pos: string | null;
  shabesh_finishing_pos: string | null;
  harish_starting_pos: number | null;
  shabesh_starting_pos: number | null;
}

function parseFinishingPos(val: unknown): number | "DNF" | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  const str = String(val).trim();
  if (str.toUpperCase() === "DNF") return "DNF";
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? undefined : parsed;
}

function toNullableInt(val: unknown): number | null {
  if (val === undefined || val === null || val === "") return null;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? null : parsed;
}

function rowToRace(row: RaceRow): RaceResult {
  return {
    id: row.id,
    game: row.game as RaceResult["game"],
    track: row.track,
    carClass: row.car_class,
    conditions: row.conditions as RaceResult["conditions"],
    winner: row.winner as RaceResult["winner"],
    fastestLap: row.fastest_lap as RaceResult["fastestLap"],
    fastestLapTime: row.fastest_lap_time,
    date: row.date,
    laps: row.laps ?? undefined,
    raceDuration: row.race_duration ?? undefined,
    harishFinishingPos: parseFinishingPos(row.harish_finishing_pos),
    shabeshFinishingPos: parseFinishingPos(row.shabesh_finishing_pos),
    harishStartingPos: row.harish_starting_pos ?? undefined,
    shabeshStartingPos: row.shabesh_starting_pos ?? undefined,
  };
}

async function getAllRaces(db: D1Database): Promise<RaceResult[]> {
  const { results } = await db
    .prepare("SELECT * FROM races ORDER BY date ASC, created_at ASC")
    .all<RaceRow>();
  return (results || []).map(rowToRace);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/races" && request.method === "GET") {
      const races = await getAllRaces(env.DB);
      return json(races);
    }

    if (url.pathname === "/api/races" && request.method === "POST") {
      let body: Record<string, unknown>;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }

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
        shabeshStartingPos,
      } = body as Record<string, any>;

      if (!game || !track || !winner || !fastestLap || !fastestLapTime || !date) {
        return json({ error: "Missing required fields" }, 400);
      }

      // DNF-aware winner resolution, mirrors the client-side logic as a safety net.
      const hFin = parseFinishingPos(harishFinishingPos);
      const sFin = parseFinishingPos(shabeshFinishingPos);
      let finalWinner = winner;
      if (hFin === "DNF" && sFin !== "DNF" && sFin !== undefined) {
        finalWinner = "Shabesh";
      } else if (sFin === "DNF" && hFin !== "DNF" && hFin !== undefined) {
        finalWinner = "Harish";
      } else if (typeof hFin === "number" && typeof sFin === "number") {
        if (hFin < sFin) finalWinner = "Harish";
        else if (sFin < hFin) finalWinner = "Shabesh";
      }

      const id = "race_" + Date.now();
      await env.DB.prepare(
        `INSERT INTO races (
          id, game, track, car_class, conditions, winner, fastest_lap, fastest_lap_time, date,
          laps, race_duration, harish_finishing_pos, shabesh_finishing_pos, harish_starting_pos, shabesh_starting_pos
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`
      )
        .bind(
          id,
          game,
          track,
          carClass || "Default Class",
          conditions || "Dry - Day",
          finalWinner,
          fastestLap,
          fastestLapTime,
          date,
          toNullableInt(laps),
          raceDuration || null,
          hFin !== undefined ? String(hFin) : null,
          sFin !== undefined ? String(sFin) : null,
          toNullableInt(harishStartingPos),
          toNullableInt(shabeshStartingPos)
        )
        .run();

      const races = await getAllRaces(env.DB);
      return json(races, 201);
    }

    const deleteMatch = url.pathname.match(/^\/api\/races\/([^/]+)$/);
    if (deleteMatch && request.method === "DELETE") {
      const id = decodeURIComponent(deleteMatch[1]);
      const { meta } = await env.DB.prepare("DELETE FROM races WHERE id = ?1").bind(id).run();
      if (!meta.changes) {
        return json({ error: "Race result not found" }, 404);
      }
      const races = await getAllRaces(env.DB);
      return json(races);
    }

    return env.ASSETS.fetch(request);
  },
};
