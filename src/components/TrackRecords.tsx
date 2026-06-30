import React, { useState } from "react";
import { RaceResult, GAMES_AND_TRACKS, GameType } from "../types";
import { parseTimeToSeconds } from "../utils";
import { Trophy, Award, Search, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TrackRecordsProps {
  races: RaceResult[];
}

interface TrackRecord {
  game: GameType;
  track: string;
  holder: "Harish" | "Shabesh";
  time: string;
  seconds: number;
  carClass: string;
  date: string;
}

export default function TrackRecords({ races }: TrackRecordsProps) {
  const [selectedGame, setSelectedGame] = useState<GameType>("Formula 1");
  const [searchTrack, setSearchTrack] = useState("");

  // Calculate track records for ALL game/track combinations based on all logged races
  const calculateRecords = (): TrackRecord[] => {
    const recordsMap: Record<string, TrackRecord> = {};

    races.forEach((race) => {
      const key = `${race.game}-${race.track}`;
      const parsedSeconds = parseTimeToSeconds(race.fastestLapTime);

      if (parsedSeconds > 0) {
        const existingRecord = recordsMap[key];
        if (!existingRecord || parsedSeconds < existingRecord.seconds) {
          recordsMap[key] = {
            game: race.game,
            track: race.track,
            holder: race.fastestLap,
            time: race.fastestLapTime,
            seconds: parsedSeconds,
            carClass: race.carClass,
            date: race.date
          };
        }
      }
    });

    return Object.values(recordsMap);
  };

  const records = calculateRecords();

  // Find records for the currently selected game
  const tracksForGame = GAMES_AND_TRACKS[selectedGame] || [];
  const filteredRecords = tracksForGame.map((track) => {
    const record = records.find((r) => r.game === selectedGame && r.track.toLowerCase() === track.toLowerCase());
    return {
      track,
      record
    };
  }).filter(({ track }) => track.toLowerCase().includes(searchTrack.toLowerCase()));

  // Calculate Record stats
  const harishRecordCount = records.filter((r) => r.holder === "Harish").length;
  const shabeshRecordCount = records.filter((r) => r.holder === "Shabesh").length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Circuit Record Holders
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Hall of fame tracking fastest lap records across all game circuits
          </p>
        </div>

        {/* Record Counter Badges */}
        <div className="flex gap-2 font-mono text-xs">
          <div className="bg-red-950/40 border border-red-900/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-zinc-400">Harish:</span>
            <span className="text-white font-bold">{harishRecordCount} Records</span>
          </div>
          <div className="bg-cyan-950/40 border border-cyan-900/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-zinc-400">Shabesh:</span>
            <span className="text-white font-bold">{shabeshRecordCount} Records</span>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Game Switcher Tabs */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850 flex-grow max-w-full overflow-x-auto">
          {(["Formula 1", "Assetto Corsa", "Auto Mobilista 2"] as GameType[]).map((game) => {
            const isActive = selectedGame === game;
            return (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`flex-1 py-2 px-4 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-zinc-900 text-white border border-zinc-800 shadow-md"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {game}
              </button>
            );
          })}
        </div>

        {/* Track search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchTrack}
            onChange={(e) => setSearchTrack(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 text-sm transition-colors"
          />
        </div>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredRecords.map(({ track, record }) => (
            <motion.div
              layout
              key={track}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-xl border p-4 flex flex-col justify-between overflow-hidden transition-all h-[135px] ${
                record
                  ? record.holder === "Harish"
                    ? "bg-zinc-900/50 border-red-950/60 hover:border-red-800/60"
                    : "bg-zinc-900/50 border-cyan-950/60 hover:border-cyan-800/60"
                  : "bg-zinc-950 border-zinc-850 opacity-60"
              }`}
            >
              {/* Subtle background glow for holders */}
              {record && (
                <div
                  className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl -z-10 ${
                    record.holder === "Harish" ? "bg-red-600/5" : "bg-cyan-600/5"
                  }`}
                />
              )}

              {/* Top Row: Track & Game badge */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">{track}</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
                    {selectedGame}
                  </p>
                </div>
                {record ? (
                  <div className={`p-1.5 rounded ${
                    record.holder === "Harish" ? "bg-red-950/40 text-red-400" : "bg-cyan-950/40 text-cyan-400"
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-600 uppercase border border-zinc-850 px-2 py-0.5 rounded bg-zinc-950">
                    Vacant
                  </span>
                )}
              </div>

              {/* Bottom Row: Holder and Time */}
              {record ? (
                <div className="mt-4 flex items-end justify-between border-t border-zinc-800/40 pt-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">
                      Record Holder
                    </span>
                    <span className={`text-sm font-bold font-mono ${
                      record.holder === "Harish" ? "text-red-400" : "text-cyan-400"
                    }`}>
                      {record.holder}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">
                      Lap Record
                    </span>
                    <span className="text-sm font-mono font-black text-white bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 shadow-inner">
                      {record.time}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-between text-zinc-600 text-xs font-mono border-t border-zinc-800/40 pt-3">
                  <span>No timing logged yet</span>
                  <span className="text-[10px] uppercase">-- : -- . ---</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
