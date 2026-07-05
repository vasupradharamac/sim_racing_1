import React, { useState, useEffect } from "react";
import { RaceResult } from "../types";
import { parseTimeToSeconds, formatSecondsToTime, getTrackLengthKM } from "../utils";
import { Gauge, Timer, Milestone, Award, Compass, TrendingUp, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface PersistentProgressProps {
  races: RaceResult[];
}

const KM_TO_MILES = 0.621371;

// Mock data for the interactive simulator preview
const DEMO_RACES: RaceResult[] = [
  {
    id: "demo_1",
    game: "Formula 1",
    track: "United Kingdom (Silverstone)",
    carClass: "F1 2024",
    conditions: "Dry - Day",
    winner: "Harish",
    fastestLap: "Harish",
    fastestLapTime: "1:27.420",
    date: "2026-07-01",
    laps: 10,
    raceDuration: "15:20.450",
    harishStartingPos: 1,
    shabeshStartingPos: 2,
    harishFinishingPos: 1,
    shabeshFinishingPos: 2
  },
  {
    id: "demo_2",
    game: "Automobilista 2",
    track: "Interlagos (Brazil)",
    carClass: "Stock Car V8",
    conditions: "Wet - Day",
    winner: "Shabesh",
    fastestLap: "Harish",
    fastestLapTime: "1:35.110",
    date: "2026-07-02",
    laps: 12,
    raceDuration: "20:10.150",
    harishStartingPos: 3,
    shabeshStartingPos: 1,
    harishFinishingPos: 2,
    shabeshFinishingPos: 1
  },
  {
    id: "demo_3",
    game: "Assetto Corsa",
    track: "Monza (Italy)",
    carClass: "GT3",
    conditions: "Dry - Night",
    winner: "Shabesh",
    fastestLap: "Shabesh",
    fastestLapTime: "1:48.550",
    date: "2026-07-03",
    laps: 15,
    raceDuration: "28:34.900",
    harishStartingPos: 2,
    shabeshStartingPos: 5,
    harishFinishingPos: 4,
    shabeshFinishingPos: 1
  }
];

export default function PersistentProgress({ races: realRaces }: PersistentProgressProps) {
  const [useImperial, setUseImperial] = useState<boolean>(() => {
    const saved = localStorage.getItem("telemetry_unit_imperial");
    return saved === "true";
  });
  
  const [showDemo, setShowDemo] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("telemetry_unit_imperial", String(useImperial));
  }, [useImperial]);

  const activeRaces = realRaces.length > 0 ? realRaces : (showDemo ? DEMO_RACES : []);
  const hasData = activeRaces.length > 0;

  // Compute stats
  let totalLaps = 0;
  let totalTrackTimeSeconds = 0;
  let totalDistanceKM = 0;

  let harishLaps = 0;
  let shabeshLaps = 0;
  let harishDistanceKM = 0;
  let shabeshDistanceKM = 0;

  let harishDurationSeconds = 0;
  let shabeshDurationSeconds = 0;

  let totalRacesCount = 0;
  let harishFastestLapsCount = 0;
  let shabeshFastestLapsCount = 0;

  let harishTotalStartingPos = 0;
  let harishTotalFinishingPos = 0;
  let shabeshTotalStartingPos = 0;
  let shabeshTotalFinishingPos = 0;

  activeRaces.forEach((race) => {
    const laps = race.laps || 0;
    const durationSec = parseTimeToSeconds(race.raceDuration || "");
    const lapLenKM = getTrackLengthKM(race.track);
    const raceDistanceKM = laps * lapLenKM;

    totalLaps += laps;
    totalTrackTimeSeconds += durationSec;
    totalDistanceKM += raceDistanceKM;

    harishDistanceKM += raceDistanceKM;
    shabeshDistanceKM += raceDistanceKM;
    harishLaps += laps;
    shabeshLaps += laps;

    if (race.raceDuration) {
      harishDurationSeconds += durationSec;
      shabeshDurationSeconds += durationSec;
    }

    totalRacesCount++;
    if (race.fastestLap === "Harish") harishFastestLapsCount++;
    if (race.fastestLap === "Shabesh") shabeshFastestLapsCount++;

    const hFin = race.harishFinishingPos !== undefined ? race.harishFinishingPos : (race.winner === "Harish" ? 1 : 2);
    const sFin = race.shabeshFinishingPos !== undefined ? race.shabeshFinishingPos : (race.winner === "Shabesh" ? 1 : 2);
    const hStart = race.harishStartingPos !== undefined ? race.harishStartingPos : (race.winner === "Harish" ? 1 : 2);
    const sStart = race.shabeshStartingPos !== undefined ? race.shabeshStartingPos : (race.winner === "Shabesh" ? 2 : 1);

    harishTotalStartingPos += hStart;
    harishTotalFinishingPos += hFin;
    shabeshTotalStartingPos += sStart;
    shabeshTotalFinishingPos += sFin;
  });

  const harishAvgStarting = totalRacesCount > 0 ? (harishTotalStartingPos / totalRacesCount).toFixed(1) : "0.0";
  const harishAvgFinishing = totalRacesCount > 0 ? (harishTotalFinishingPos / totalRacesCount).toFixed(1) : "0.0";
  const shabeshAvgStarting = totalRacesCount > 0 ? (shabeshTotalStartingPos / totalRacesCount).toFixed(1) : "0.0";
  const shabeshAvgFinishing = totalRacesCount > 0 ? (shabeshTotalFinishingPos / totalRacesCount).toFixed(1) : "0.0";

  // Position differentials (Grid Positions gained/lost)
  const harishDiff = totalRacesCount > 0 ? (parseFloat(harishAvgStarting) - parseFloat(harishAvgFinishing)).toFixed(1) : "0.0";
  const shabeshDiff = totalRacesCount > 0 ? (parseFloat(shabeshAvgStarting) - parseFloat(shabeshAvgFinishing)).toFixed(1) : "0.0";

  const totalFastestLaps = harishFastestLapsCount + shabeshFastestLapsCount || 1;
  const harishFastestLapsPercent = Math.min((harishFastestLapsCount / totalFastestLaps) * 100, 100);
  const shabeshFastestLapsPercent = 100 - harishFastestLapsPercent;

  const distanceUnit = useImperial ? "MI" : "KM";
  const conversionFactor = useImperial ? KM_TO_MILES : 1;
  const totalDistanceFormatted = (totalDistanceKM * conversionFactor).toFixed(1);

  // Position Path Indicator SVG generator
  const renderGridLane = (start: string, finish: string, isHarish: boolean) => {
    const s = parseFloat(start) || 1;
    const f = parseFloat(finish) || 1;
    const isGained = f < s; // Finishing index is lower (meaning they gained places)
    const color = isHarish ? "stroke-red-500" : "stroke-cyan-400";
    const bgGlow = isHarish ? "bg-red-500/10" : "bg-cyan-500/10";
    const textCol = isHarish ? "text-red-400" : "text-cyan-400";

    return (
      <div className="bg-[#030304] border border-white/[0.02] rounded-xl p-3.5 space-y-3">
        <div className="flex justify-between items-center text-[9px] font-mono tracking-wider text-zinc-500">
          <span className="font-bold">{isHarish ? "SOLOARMADA" : "VIATICMONK"} OVERTAKE FACTOR</span>
          <span className={`font-semibold px-2 py-0.5 rounded ${bgGlow} ${textCol}`}>
            {f === s ? "No Net Change" : isGained ? `+${(s - f).toFixed(1)} Positions Gained` : `-${(f - s).toFixed(1)} Positions Lost`}
          </span>
        </div>
        
        {/* Mock visual lane */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-zinc-600">Start: P{start}</span>
          <div className="flex-grow h-1 bg-zinc-950 rounded-full relative flex items-center">
            {/* Connection line */}
            <div 
              style={{
                left: `${Math.min((s / 8) * 100, 90)}%`,
                width: `${Math.abs(((s - f) / 8) * 100)}%`
              }}
              className={`absolute h-[2px] ${isGained ? "bg-emerald-500" : "bg-red-500"}`}
            />
            {/* Start Node */}
            <div 
              style={{ left: `${Math.min((s / 8) * 100, 90)}%` }}
              className="absolute w-2.5 h-2.5 rounded-full bg-zinc-700 border border-black z-10"
              title="Start"
            />
            {/* Finish Node */}
            <div 
              style={{ left: `${Math.min((f / 8) * 100, 90)}%` }}
              className={`absolute w-3.5 h-3.5 rounded-full ${isHarish ? "bg-red-500" : "bg-cyan-400"} border-2 border-black z-20 flex items-center justify-center`}
              title="Finish"
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>
          <span className="font-mono text-[10px] text-white font-bold">Finish: P{finish}</span>
        </div>
      </div>
    );
  };

  // Exquisite mechanical screw rivet decoration for dashboard housing
  const CornerRivets = () => (
    <>
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 shadow-inner flex items-center justify-center">
        <div className="w-[1px] h-full bg-zinc-950/80 rotate-45" />
      </div>
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 shadow-inner flex items-center justify-center">
        <div className="w-[1px] h-full bg-zinc-950/80 -rotate-12" />
      </div>
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 shadow-inner flex items-center justify-center">
        <div className="w-[1px] h-full bg-zinc-950/80 rotate-12" />
      </div>
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 shadow-inner flex items-center justify-center">
        <div className="w-[1px] h-full bg-zinc-950/80 -rotate-45" />
      </div>
    </>
  );

  return (
    <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden shadow-2xl shadow-black/80">
      <CornerRivets />
      
      {/* Header with PM Unit Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/[0.02] pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#c5a880]/5 p-2.5 rounded-xl border border-[#c5a880]/15 text-[#c5a880]">
            <Gauge className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-[#c5a880] tracking-[0.25em] uppercase font-bold block mb-1">
              ACHIEVEMENT REGISTRY • TELEMETRY ENGINE
            </span>
            <h2 className="text-2xl font-display font-light text-white tracking-tight flex items-center gap-2">
              Achievement Dashboard
              {realRaces.length === 0 && !showDemo && (
                <span className="text-[7px] font-mono font-bold bg-white/5 text-zinc-500 px-2 py-0.5 rounded border border-white/5 uppercase tracking-widest">
                  Standby
                </span>
              )}
              {showDemo && realRaces.length === 0 && (
                <span className="text-[7px] font-mono font-bold bg-[#c5a880]/10 text-[#c5a880] px-2 py-0.5 rounded border border-[#c5a880]/20 uppercase tracking-widest">
                  DEMO ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">
              Accumulated track distance, qualification statistics, and overtaking records.
            </p>
          </div>
        </div>

        {/* Configuration Unit Selector Toolbar */}
        <div className="flex items-center gap-2 font-mono text-xs relative z-20">
          <div className="bg-[#030304] border border-white/[0.03] rounded-xl p-1 flex items-center">
            <button
              onClick={() => setUseImperial(false)}
              className={`px-3 py-1.5 rounded-lg transition-all font-mono font-semibold text-[9px] tracking-wider ${
                !useImperial
                  ? "bg-white text-black shadow-md font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              METRIC (KM)
            </button>
            <button
              onClick={() => setUseImperial(true)}
              className={`px-3 py-1.5 rounded-lg transition-all font-mono font-semibold text-[9px] tracking-wider ${
                useImperial
                  ? "bg-white text-black shadow-md font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              IMPERIAL (MI)
            </button>
          </div>
        </div>
      </div>

      {!hasData ? (
        /* ================= EMPTY STATE INITIATION PANEL ================= */
        <div className="bg-[#030304]/60 border border-white/[0.02] rounded-2xl p-8 text-center relative overflow-hidden z-10">
          <div className="max-w-md mx-auto py-4">
            <div className="w-10 h-10 bg-[#c5a880]/5 border border-[#c5a880]/15 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#c5a880]">
              <Compass className="w-4 h-4 text-[#c5a880] animate-spin" />
            </div>
            
            <h3 className="text-xs font-mono text-zinc-200 tracking-widest uppercase font-black">TELEMETRY INSTRUMENTS STANDBY</h3>
            <p className="text-xs text-zinc-500 mt-2 font-sans leading-relaxed">
              No active races are currently compiled inside the racing database. Activate the telemetry demo stream to preview real-time calculations.
            </p>

            {/* Simulated Live Preview Toggle */}
            <div className="mt-8 inline-flex items-center gap-4 bg-[#070709] border border-white/[0.03] rounded-2xl p-4 text-left shadow-lg">
              <div className="text-[9px] text-zinc-500 font-sans leading-normal">
                <span className="text-white font-semibold block">Telemetry Sandbox</span>
                Synthesizes simulated metrics with complete track telemetry.
              </div>
              <button
                onClick={() => setShowDemo(!showDemo)}
                className={`px-4 py-2.5 rounded-xl font-mono text-[9px] font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer ${
                  showDemo
                    ? "bg-[#c5a880] text-black hover:bg-[#dfcbaf]"
                    : "bg-white/5 text-zinc-300 hover:text-white border border-white/5"
                }`}
              >
                {showDemo ? "Disable Demo" : "Enable Demo"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= ACTIVE STATE STATISTICS COCKPIT ================= */
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Simulated Track Mileage */}
            <div className="bg-[#030304]/80 border border-white/[0.03] rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-800/60" />
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                  Odometer Distance
                </span>
                <Milestone className="w-3.5 h-3.5 text-[#c5a880] opacity-60" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2.5 relative">
                <div className="absolute -left-2 -right-2 top-0 bottom-0 border border-dashed border-[#c5a880]/5 rounded-full scale-125 pointer-events-none" />
                <span className="text-4xl font-display font-light text-white tracking-tight">{totalDistanceFormatted}</span>
                <span className="text-[8px] text-zinc-500 font-mono font-bold tracking-widest">{distanceUnit}</span>
              </div>
              <p className="text-[9px] text-zinc-600 font-mono tracking-wider uppercase mt-3 leading-relaxed">
                AGGREGATED VIRTUAL MILEAGE REGISTERED ON CIRCUIT TELEMETRY.
              </p>
            </div>

            {/* Fastest Lap Duel */}
            <div className="bg-[#030304]/80 border border-white/[0.03] rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-800/60" />
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                  FASTEST LAP DUELS
                </span>
                <Award className="w-3.5 h-3.5 text-amber-500 opacity-60" />
              </div>
              <div className="flex items-baseline gap-1 mt-2.5">
                <span className="text-3xl font-display font-bold text-[#df8f73]">
                  {harishFastestLapsCount}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono mx-2">VS</span>
                <span className="text-3xl font-display font-bold text-[#94a9b8]">
                  {shabeshFastestLapsCount}
                </span>
              </div>
              <p className="text-[9px] text-zinc-600 font-mono tracking-wider uppercase mt-3 leading-relaxed">
                RAW VELOCITY SPLITS ACCUMULATED FROM SAVED RECORDS.
              </p>
            </div>

            {/* Harish Average Grid stats */}
            <div className="bg-[#030304]/80 border border-white/[0.03] rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-800/60" />
              <span className="text-[8px] font-mono text-[#df8f73] uppercase tracking-widest block font-black">
                COCKPIT POSITION • SOLOARMADA
              </span>
              <div className="mt-2.5 flex justify-between items-baseline">
                <div className="text-[10px] font-mono text-zinc-500">
                  QUALI: <span className="text-white font-display text-lg font-medium">P{harishAvgStarting}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  RACE: <span className="text-white font-display text-lg font-medium">P{harishAvgFinishing}</span>
                </div>
              </div>
              <p className="text-[9px] text-zinc-600 font-mono tracking-wider uppercase mt-3 leading-relaxed">
                AVERAGE START vs FINISH POSITIONS ON TELEMETRY GRID.
              </p>
            </div>

            {/* Shabesh Average Grid stats */}
            <div className="bg-[#030304]/80 border border-white/[0.03] rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-800/60" />
              <span className="text-[8px] font-mono text-[#94a9b8] uppercase tracking-widest block font-black">
                COCKPIT POSITION • VIATICMONK
              </span>
              <div className="mt-2.5 flex justify-between items-baseline">
                <div className="text-[10px] font-mono text-zinc-500">
                  QUALI: <span className="text-white font-display text-lg font-medium">P{shabeshAvgStarting}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  RACE: <span className="text-white font-display text-lg font-medium">P{shabeshAvgFinishing}</span>
                </div>
              </div>
              <p className="text-[9px] text-zinc-600 font-mono tracking-wider uppercase mt-3 leading-relaxed">
                AVERAGE START vs FINISH POSITIONS ON TELEMETRY GRID.
              </p>
            </div>
          </div>

          {/* Overtake Factor Grid lane visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/[0.02] pt-5">
            {renderGridLane(harishAvgStarting, harishAvgFinishing, true)}
            {renderGridLane(shabeshAvgStarting, shabeshAvgFinishing, false)}
          </div>

          {/* Split progression bar */}
          <div className="space-y-4 border-t border-white/[0.02] pt-5">
            <div>
              <div className="flex justify-between items-center text-[9px] font-mono uppercase mb-2">
                <span className="text-zinc-500 flex items-center gap-1.5 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Speed Hegemony distribution (Fastest Lap Splits)
                </span>
                <div className="flex gap-4 tracking-wider">
                  <span className="text-red-500 font-bold">SoloArmada: {harishFastestLapsCount} ({Math.round(harishFastestLapsPercent)}%)</span>
                  <span className="text-cyan-400 font-bold">ViaticMonk: {shabeshFastestLapsCount} ({Math.round(shabeshFastestLapsPercent)}%)</span>
                </div>
              </div>
              <div className="w-full h-1 bg-black rounded-full overflow-hidden flex border border-white/[0.01]">
                <div style={{ width: `${harishFastestLapsPercent}%` }} className="bg-red-500 transition-all duration-700" />
                <div style={{ width: `${shabeshFastestLapsPercent}%` }} className="bg-cyan-400 transition-all duration-700" />
              </div>
            </div>
          </div>

          {/* Context Notice if Demo active */}
          {showDemo && realRaces.length === 0 && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-center text-[10px] text-amber-500 font-mono tracking-wider uppercase font-semibold">
              💡 Simulator preview active. Log a race on the side form to start tracking actual telemetry metrics.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
