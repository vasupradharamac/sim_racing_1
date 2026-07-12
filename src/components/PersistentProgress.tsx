import React, { useState, useEffect } from "react";
import { RaceResult } from "../types";
import { parseTimeToSeconds, formatSecondsToTime, getTrackLengthKM } from "../utils";
import { Gauge, Timer, Milestone, Award, Compass, TrendingUp, ChevronRight, AlertTriangle, Zap, ShieldCheck } from "lucide-react";
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
  let harishDnfs = 0;
  let shabeshDnfs = 0;

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
    if (race.harishFinishingPos === "DNF") harishDnfs++;
    if (race.shabeshFinishingPos === "DNF") shabeshDnfs++;

    const hFinRaw = race.harishFinishingPos !== undefined ? race.harishFinishingPos : (race.winner === "Harish" ? 1 : 2);
    const sFinRaw = race.shabeshFinishingPos !== undefined ? race.shabeshFinishingPos : (race.winner === "Shabesh" ? 1 : 2);
    const hFin = hFinRaw === "DNF" ? 2 : hFinRaw;
    const sFin = sFinRaw === "DNF" ? 2 : sFinRaw;
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
    const bgGlow = isHarish ? "bg-red-500/10 border-red-500/20" : "bg-cyan-500/10 border-cyan-500/20";
    const textCol = isHarish ? "text-[#df8f73]" : "text-[#94a9b8]";

    return (
      <div className="bg-[#121217]/90 border border-white/[0.08] rounded-2xl p-4.5 space-y-3.5 relative overflow-hidden shadow-xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none" />
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-zinc-400">
          <span className="font-bold flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isHarish ? "bg-[#df8f73]" : "bg-[#94a9b8]"}`} />
            {isHarish ? "SOLOARMADA (HARISH)" : "VIATICMONK (SHABESH)"}
          </span>
          <span className={`font-semibold px-2.5 py-1 rounded-md border ${bgGlow} ${textCol}`}>
            {f === s ? "No Net Change" : isGained ? `+${(s - f).toFixed(1)} Positions Gained` : `-${(f - s).toFixed(1)} Positions Lost`}
          </span>
        </div>
        
        {/* Mock visual lane */}
        <div className="flex items-center gap-3 pt-1">
          <span className="font-mono text-[10px] text-zinc-400 font-semibold">Start P{start}</span>
          <div className="flex-grow h-2 bg-black/60 rounded-full relative flex items-center border border-white/5 shadow-inner">
            <div 
              style={{
                left: `${Math.min((s / 8) * 100, 90)}%`,
                width: `${Math.abs(((s - f) / 8) * 100)}%`
              }}
              className={`absolute h-1.5 rounded-full ${isGained ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`}
            />
            <div 
              style={{ left: `${Math.min((s / 8) * 100, 90)}%` }}
              className="absolute w-3 h-3 rounded-full bg-zinc-700 border-2 border-black z-10 shadow"
              title="Start"
            />
            <div 
              style={{ left: `${Math.min((f / 8) * 100, 90)}%` }}
              className={`absolute w-4 h-4 rounded-full ${isHarish ? "bg-[#df8f73]" : "bg-[#94a9b8]"} border-2 border-black z-20 flex items-center justify-center shadow-lg`}
              title="Finish"
            >
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
          </div>
          <span className="font-mono text-[10px] text-white font-bold">Finish P{finish}</span>
        </div>
      </div>
    );
  };

  // Exquisite mechanical screw rivet decoration for dashboard housing
  const CornerRivets = () => (
    <>
      <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600/60 shadow-inner flex items-center justify-center z-20">
        <div className="w-[1px] h-full bg-zinc-950/90 rotate-45" />
      </div>
      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600/60 shadow-inner flex items-center justify-center z-20">
        <div className="w-[1px] h-full bg-zinc-950/90 -rotate-12" />
      </div>
      <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600/60 shadow-inner flex items-center justify-center z-20">
        <div className="w-[1px] h-full bg-zinc-950/90 rotate-12" />
      </div>
      <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600/60 shadow-inner flex items-center justify-center z-20">
        <div className="w-[1px] h-full bg-zinc-950/90 -rotate-45" />
      </div>
    </>
  );

  return (
    <div className="bg-[#141418]/95 backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-black/90">
      <CornerRivets />
      
      {/* Header with PM Unit Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8 border-b border-white/[0.08] pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 p-3 rounded-2xl border border-[#c5a880]/30 text-[#c5a880] shadow-lg">
            <Gauge className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono text-[#c5a880] tracking-[0.25em] uppercase font-bold">
                ACHIEVEMENT REGISTRY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-light text-white tracking-tight flex items-center gap-3">
              Achievement Dashboard
              {realRaces.length === 0 && !showDemo && (
                <span className="text-[8px] font-mono font-bold bg-white/10 text-zinc-400 px-2.5 py-1 rounded-md border border-white/10 uppercase tracking-widest backdrop-blur-md">
                  Standby
                </span>
              )}
              {showDemo && realRaces.length === 0 && (
                <span className="text-[8px] font-mono font-bold bg-[#c5a880]/20 text-[#c5a880] px-2.5 py-1 rounded-md border border-[#c5a880]/35 uppercase tracking-widest backdrop-blur-md">
                  DEMO ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Accumulated track distance, qualification statistics, and overtaking records.
            </p>
          </div>
        </div>

        {/* Configuration Unit Selector Toolbar */}
        <div className="flex items-center gap-2 font-mono text-xs relative z-20">
          <div className="bg-[#0c0c0f] border border-white/10 rounded-2xl p-1.5 flex items-center shadow-xl">
            <button
              onClick={() => setUseImperial(false)}
              className={`px-3.5 py-2 rounded-xl transition-all font-mono font-semibold text-[10px] tracking-wider ${
                !useImperial
                  ? "bg-[#c5a880] text-black shadow-lg font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              METRIC (KM)
            </button>
            <button
              onClick={() => setUseImperial(true)}
              className={`px-3.5 py-2 rounded-xl transition-all font-mono font-semibold text-[10px] tracking-wider ${
                useImperial
                  ? "bg-[#c5a880] text-black shadow-lg font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              IMPERIAL (MI)
            </button>
          </div>
        </div>
      </div>

      {!hasData ? (
        /* ================= EMPTY STATE INITIATION PANEL ================= */
        <div className="bg-[#0e0e12]/80 border border-white/[0.08] rounded-2xl p-10 text-center relative overflow-hidden z-10 shadow-2xl">
          <div className="max-w-md mx-auto py-6">
            <div className="w-14 h-14 bg-[#c5a880]/10 border border-[#c5a880]/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#c5a880] shadow-lg">
              <Compass className="w-6 h-6 text-[#c5a880] animate-spin" />
            </div>
            
            <h3 className="text-sm font-mono text-zinc-200 tracking-widest uppercase font-black">TELEMETRY INSTRUMENTS STANDBY</h3>
            <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
              No active races are currently compiled inside the racing database. Activate the telemetry demo stream to preview real-time calculations.
            </p>

            {/* Simulated Live Preview Toggle */}
            <div className="mt-8 inline-flex items-center gap-5 bg-[#141418] border border-white/10 rounded-2xl p-4 text-left shadow-2xl">
              <div className="text-[10px] text-zinc-300 font-sans leading-normal">
                <span className="text-white font-bold block mb-0.5">Telemetry Sandbox</span>
                Synthesizes simulated metrics with complete track telemetry.
              </div>
              <button
                onClick={() => setShowDemo(!showDemo)}
                className={`px-5 py-3 rounded-xl font-mono text-[10px] font-bold tracking-widest uppercase transition-all shadow-xl cursor-pointer ${
                  showDemo
                    ? "bg-[#c5a880] text-black hover:bg-[#dfcbaf]"
                    : "bg-white/10 text-zinc-200 hover:text-white border border-white/20"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Simulated Track Mileage */}
            <div className="bg-[#121217]/90 border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group hover:border-[#c5a880]/40 transition-all shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#c5a880]/10 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-black">
                  Odometer Distance
                </span>
                <div className="p-2 rounded-xl bg-[#c5a880]/10 text-[#c5a880]">
                  <Milestone className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-4 relative">
                <span className="text-4xl md:text-5xl font-display font-light text-white tracking-tight">{totalDistanceFormatted}</span>
                <span className="text-xs text-[#c5a880] font-mono font-bold tracking-widest">{distanceUnit}</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase mt-3 leading-relaxed">
                AGGREGATED VIRTUAL MILEAGE REGISTERED ON CIRCUIT TELEMETRY.
              </p>
            </div>

            {/* Fastest Lap Duel */}
            <div className="bg-[#121217]/90 border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-black">
                  FASTEST LAP DUELS
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl md:text-4xl font-display font-bold text-[#df8f73]">
                  {harishFastestLapsCount}
                </span>
                <span className="text-xs text-zinc-500 font-mono mx-1">VS</span>
                <span className="text-3xl md:text-4xl font-display font-bold text-[#94a9b8]">
                  {shabeshFastestLapsCount}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase mt-3 leading-relaxed">
                RAW VELOCITY SPLITS ACCUMULATED FROM SAVED RECORDS.
              </p>
            </div>

            {/* Cockpit Position Averages */}
            <div className="bg-[#121217]/90 border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-black">
                  COCKPIT POSITION AVERAGES
                </span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[8px] font-mono text-[#df8f73] font-bold">SOLOARMADA</div>
                  <div className="text-xs font-mono text-zinc-300 mt-1">
                    Q: <span className="text-white font-bold">P{harishAvgStarting}</span> | R: <span className="text-white font-bold">P{harishAvgFinishing}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-mono text-[#94a9b8] font-bold">VIATICMONK</div>
                  <div className="text-xs font-mono text-zinc-300 mt-1">
                    Q: <span className="text-white font-bold">P{shabeshAvgStarting}</span> | R: <span className="text-white font-bold">P{shabeshAvgFinishing}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase mt-3 leading-relaxed">
                AVERAGE START vs FINISH POSITIONS ON TELEMETRY GRID.
              </p>
            </div>

            {/* Total DNF Count */}
            <div className="bg-[#121217]/90 border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/40 transition-all shadow-xl backdrop-blur-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-black">
                  TOTAL DNF COUNT
                </span>
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl md:text-4xl font-display font-bold text-[#df8f73]">
                  {harishDnfs}
                </span>
                <span className="text-xs text-zinc-500 font-mono mx-1">VS</span>
                <span className="text-3xl md:text-4xl font-display font-bold text-[#94a9b8]">
                  {shabeshDnfs}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase mt-3 leading-relaxed">
                ACCUMULATED DID-NOT-FINISH RETIREMENTS.
              </p>
            </div>
          </div>

          {/* Overtake Factor Grid lane visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-white/[0.08] pt-6">
            {renderGridLane(harishAvgStarting, harishAvgFinishing, true)}
            {renderGridLane(shabeshAvgStarting, shabeshAvgFinishing, false)}
          </div>

          {/* Split progression bar */}
          <div className="space-y-4 border-t border-white/[0.08] pt-6">
            <div className="bg-[#121217]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center text-[10px] font-mono uppercase mb-3 gap-2">
                <span className="text-zinc-300 flex items-center gap-2 tracking-wider font-semibold">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Speed Hegemony Distribution (Fastest Lap Splits)
                </span>
                <div className="flex gap-4 tracking-wider">
                  <span className="text-[#df8f73] font-bold">SoloArmada: {harishFastestLapsCount} ({Math.round(harishFastestLapsPercent)}%)</span>
                  <span className="text-[#94a9b8] font-bold">ViaticMonk: {shabeshFastestLapsCount} ({Math.round(shabeshFastestLapsPercent)}%)</span>
                </div>
              </div>
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden flex border border-white/10 shadow-inner">
                <div style={{ width: `${harishFastestLapsPercent}%` }} className="bg-gradient-to-r from-red-600 to-[#df8f73] transition-all duration-700" />
                <div style={{ width: `${shabeshFastestLapsPercent}%` }} className="bg-gradient-to-r from-[#94a9b8] to-cyan-500 transition-all duration-700" />
              </div>
            </div>
          </div>

          {/* Context Notice if Demo active */}
          {showDemo && realRaces.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center text-xs text-amber-400 font-mono tracking-wider uppercase font-semibold backdrop-blur-md shadow-xl flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Simulator preview active. Log a race on the side form to start tracking actual telemetry metrics.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
