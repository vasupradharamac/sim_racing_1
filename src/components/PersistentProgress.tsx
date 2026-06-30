import React from "react";
import { RaceResult } from "../types";
import { parseTimeToSeconds, formatSecondsToTime } from "../utils";
import { Activity, Gauge, Timer, RotateCcw, Award } from "lucide-react";
import { motion } from "motion/react";

interface PersistentProgressProps {
  races: RaceResult[];
}

export default function PersistentProgress({ races }: PersistentProgressProps) {
  // Let's compute statistics for Harish and Shabesh
  let totalLaps = 0;
  let totalTrackTimeSeconds = 0;

  let harishLaps = 0;
  let shabeshLaps = 0;

  let harishDurationSeconds = 0;
  let shabeshDurationSeconds = 0;

  races.forEach((race) => {
    const rLaps = race.laps || 0;
    totalLaps += rLaps;

    // Parse duration if available
    const parsedDuration = parseTimeToSeconds(race.raceDuration || "");
    totalTrackTimeSeconds += parsedDuration;

    // If winner is Harish, attribute laps & time to Harish
    if (race.winner === "Harish") {
      harishLaps += rLaps;
      harishDurationSeconds += parsedDuration;
    } else if (race.winner === "Shabesh") {
      shabeshLaps += rLaps;
      shabeshDurationSeconds += parsedDuration;
    }
  });

  const totalDurationStr = formatSecondsToTime(totalTrackTimeSeconds);
  const harishDurationStr = formatSecondsToTime(harishDurationSeconds);
  const shabeshDurationStr = formatSecondsToTime(shabeshDurationSeconds);

  // Percent splits for styling
  const maxLaps = Math.max(harishLaps, shabeshLaps) || 1;
  const harishLapPercent = Math.min((harishLaps / (harishLaps + shabeshLaps || 1)) * 100, 100);
  const shabeshLapPercent = 100 - harishLapPercent;

  const totalTime = harishDurationSeconds + shabeshDurationSeconds || 1;
  const harishTimePercent = Math.min((harishDurationSeconds / totalTime) * 100, 100);
  const shabeshTimePercent = 100 - harishTimePercent;

  return (
    <div id="persistent-progress" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Gauge className="w-5 h-5 text-red-500" />
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Telemetry Progress & Endurance Tracker</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Real-time cumulative track endurance, mileage, and lap statistics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Tracks Explored */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
            Total Laps Driven
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-mono font-black text-white">{totalLaps}</span>
            <span className="text-xs text-zinc-400 font-mono">LAPS</span>
          </div>
          <p className="text-[10px] text-zinc-600 font-mono mt-2">
            Sum of all logged race events completed on track
          </p>
        </div>

        {/* Combined Endurance Time */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
            Endurance Time Logged
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-mono font-black text-white truncate max-w-full">
              {totalDurationStr}
            </span>
          </div>
          <p className="text-[10px] text-zinc-600 font-mono mt-2">
            Total cumulative competition track duration
          </p>
        </div>

        {/* Harish Victorious Distance */}
        <div className="bg-zinc-950 border border-red-950/60 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-red-600/5 rounded-full blur-xl -z-10" />
          <span className="text-xs font-mono text-red-400 uppercase tracking-wider block">
            Harish Victory Mileage
          </span>
          <div className="mt-2">
            <div className="text-lg font-mono font-black text-white">{harishLaps} Laps</div>
            <div className="text-xs font-mono text-zinc-400 mt-1">{harishDurationStr || "0:00.000"} on track</div>
          </div>
        </div>

        {/* Shabesh Victorious Distance */}
        <div className="bg-zinc-950 border border-cyan-950/60 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-600/5 rounded-full blur-xl -z-10" />
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
            Shabesh Victory Mileage
          </span>
          <div className="mt-2">
            <div className="text-lg font-mono font-black text-white">{shabeshLaps} Laps</div>
            <div className="text-xs font-mono text-zinc-400 mt-1">{shabeshDurationStr || "0:00.000"} on track</div>
          </div>
        </div>
      </div>

      {/* Progress Bars for Splits */}
      <div className="space-y-5 border-t border-zinc-850 pt-5">
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-zinc-400">Winning Lap Split</span>
            <div className="flex gap-4">
              <span className="text-red-500 font-bold">Harish: {harishLaps}</span>
              <span className="text-cyan-400 font-bold">Shabesh: {shabeshLaps}</span>
            </div>
          </div>
          <div className="w-full h-3 bg-zinc-950 border border-zinc-850 rounded-full overflow-hidden flex">
            {totalLaps === 0 ? (
              <div className="w-full bg-zinc-900" />
            ) : (
              <>
                <div style={{ width: `${harishLapPercent}%` }} className="bg-red-600 transition-all duration-700" />
                <div style={{ width: `${shabeshLapPercent}%` }} className="bg-cyan-500 transition-all duration-700" />
              </>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-zinc-400">Winning Track-Time Share</span>
            <div className="flex gap-4">
              <span className="text-red-500 font-bold">Harish: {harishDurationStr}</span>
              <span className="text-cyan-400 font-bold">Shabesh: {shabeshDurationStr}</span>
            </div>
          </div>
          <div className="w-full h-3 bg-zinc-950 border border-zinc-850 rounded-full overflow-hidden flex">
            {totalTrackTimeSeconds === 0 ? (
              <div className="w-full bg-zinc-900" />
            ) : (
              <>
                <div style={{ width: `${harishTimePercent}%` }} className="bg-red-600 transition-all duration-700" />
                <div style={{ width: `${shabeshTimePercent}%` }} className="bg-cyan-500 transition-all duration-700" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
