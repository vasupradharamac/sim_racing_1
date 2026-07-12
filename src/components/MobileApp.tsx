import React, { useState } from "react";
import { RaceResult } from "../types";
import { parseTimeToSeconds, formatSecondsToTime, getTrackLengthKM } from "../utils";
import PaganiRpmGauge from "./PaganiRpmGauge";
import RaceLogForm from "./RaceLogForm";
import TrackTelemetryDetail from "./TrackTelemetryDetail";
import { 
  Home, 
  PlusCircle, 
  History as HistoryIcon, 
  Trophy, 
  Flame, 
  Award, 
  Trash2, 
  RefreshCw, 
  Shield, 
  ChevronRight, 
  Compass, 
  AlertTriangle,
  Zap,
  CheckCircle2,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import carBg from "../assets/images/gtr_bg_artsy_1783078522650.jpg";
import trackBg2 from "../assets/images/mobile_track_bg_2_1783845924137.jpg";
import trackBg3 from "../assets/images/mobile_track_bg_3_1783845938475.jpg";

const trackBackgrounds = [
  { name: "Spa-Francorchamps", src: carBg },
  { name: "Nürburgring Nordschleife", src: trackBg2 },
  { name: "Monza Circuit", src: trackBg3 },
];

interface MobileAppProps {
  races: RaceResult[];
  onAddRace: (newRace: Omit<RaceResult, "id">) => Promise<boolean>;
  onDeleteRace: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
  error: string | null;
  celebratoryMessage: string | null;
  setCelebratoryMessage: (msg: string | null) => void;
}

export default function MobileApp({
  races,
  onAddRace,
  onDeleteRace,
  onRefresh,
  loading,
  error,
  celebratoryMessage,
  setCelebratoryMessage,
}: MobileAppProps) {
  const [activeMobileTab, setActiveMobileTab] = useState<"overview" | "log" | "history" | "records">("overview");
  const [historyFilterGame, setHistoryFilterGame] = useState<string>("All");
  const [selectedRecord, setSelectedRecord] = useState<{ track: string; game: string } | null>(null);
  const [bgIndex, setBgIndex] = useState<number>(0);

  // Stats calculations
  const totalRaces = races.length;
  const harishWins = races.filter((r) => r.winner === "Harish").length;
  const shabeshWins = races.filter((r) => r.winner === "Shabesh").length;
  const harishWinRatio = totalRaces > 0 ? Math.round((harishWins / totalRaces) * 100) : 0;
  const shabeshWinRatio = totalRaces > 0 ? Math.round((shabeshWins / totalRaces) * 100) : 0;

  const harishFastestLaps = races.filter((r) => r.fastestLap === "Harish").length;
  const shabeshFastestLaps = races.filter((r) => r.fastestLap === "Shabesh").length;

  let harishDnfs = 0;
  let shabeshDnfs = 0;
  races.forEach((r) => {
    if (r.harishFinishingPos === "DNF") harishDnfs++;
    if (r.shabeshFinishingPos === "DNF") shabeshDnfs++;
  });

  // Streak Calculation
  let currentStreakPlayer: "Harish" | "Shabesh" | null = null;
  let streakValue = 0;
  if (totalRaces > 0) {
    const chronologicalRaces = [...races].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let lastWinner = chronologicalRaces[chronologicalRaces.length - 1].winner;
    currentStreakPlayer = lastWinner;
    streakValue = 1;
    for (let i = chronologicalRaces.length - 2; i >= 0; i--) {
      if (chronologicalRaces[i].winner === lastWinner) {
        streakValue++;
      } else {
        break;
      }
    }
  }

  // Unique tracks for records
  const allTracks = Array.from(new Set(races.map((r) => r.track)));
  const getTopTracks = (player: "Harish" | "Shabesh"): Array<[string, number]> => {
    const playerWins = races.filter((r) => r.winner === player);
    if (playerWins.length === 0) return [];
    const trackCounts: Record<string, number> = {};
    playerWins.forEach((r) => {
      let name = r.track;
      if (name.includes("(")) {
        const match = name.match(/\(([^)]+)\)/);
        if (match) name = match[1];
      }
      trackCounts[name] = (trackCounts[name] || 0) + 1;
    });
    return Object.entries(trackCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const harishTopTracks = getTopTracks("Harish");
  const shabeshTopTracks = getTopTracks("Shabesh");
  const trackRecordsData = allTracks.map((track) => {
    const trackRaces = races.filter((r) => r.track === track);
    const valid = trackRaces.filter((r) => r.fastestLapTime && parseTimeToSeconds(r.fastestLapTime) > 0);
    if (valid.length === 0) return null;
    valid.sort((a, b) => parseTimeToSeconds(a.fastestLapTime!) - parseTimeToSeconds(b.fastestLapTime!));
    const best = valid[0];
    return {
      track,
      recordHolder: best.fastestLap,
      lapTime: best.fastestLapTime,
      game: best.game,
      date: best.date,
    };
  }).filter(Boolean) as Array<{ track: string; recordHolder: string; lapTime: string; game: string; date: string }>;

  // Filtered races for history tab
  const filteredHistory = races.filter((r) => {
    if (historyFilterGame === "All") return true;
    return r.game.toLowerCase().includes(historyFilterGame.toLowerCase());
  });

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col pb-24 relative selection:bg-white selection:text-black overflow-x-hidden">
      {/* Upper Subtle Golden Thin Accenting Bar */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#c5a880]/40 to-transparent relative z-10" />

      {/* Seamlessly Integrated Artsy Automotive Background with 75% visibility and glass frosted styling */}
      <div className="fixed inset-0 w-full pointer-events-none z-0 overflow-hidden select-none opacity-75">
        <AnimatePresence mode="wait">
          <motion.img
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.75, scale: 1.01 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            src={trackBackgrounds[bgIndex].src}
            alt={trackBackgrounds[bgIndex].name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#141418]/60 via-[#141418]/40 to-[#141418]/70 backdrop-blur-[2px]" />
      </div>

      {/* Mobile Header with Glass Frosted Styling */}
      <header className="sticky top-0 z-40 bg-[#141418]/60 backdrop-blur-xl border-b border-white/[0.12] px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="scale-75 origin-left">
            <PaganiRpmGauge />
          </div>
          <div>
            <div className="text-[7px] font-mono text-zinc-400 font-bold uppercase tracking-[0.2em]">
              MOBILE TELEMETRY
            </div>
            <h1 className="text-lg font-display font-light text-white tracking-tight">
              H2H <span className="font-sans font-extrabold text-[#c5a880]">TELEMETRY</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBgIndex((prev) => (prev + 1) % 3)}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-[10px] font-mono text-zinc-200 hover:text-white backdrop-blur-md flex items-center gap-1.5 transition-colors"
            title="Switch Dominant Track Background"
          >
            <Compass className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Track {bgIndex + 1}/3</span>
          </button>
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white/10 border border-white/20 text-zinc-200 hover:text-white backdrop-blur-md"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#c5a880]" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Celebratory Banner */}
        <AnimatePresence>
          {celebratoryMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#c5a880]/15 to-emerald-500/20 border border-[#c5a880]/40 p-4 shadow-xl backdrop-blur-xl relative"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="flex-grow">
                  <div className="text-[8px] font-mono uppercase tracking-widest text-[#c5a880] font-bold">
                    Session Logged
                  </div>
                  <div className="text-sm font-display font-medium text-white mt-0.5">
                    {celebratoryMessage}
                  </div>
                </div>
                <button
                  onClick={() => setCelebratoryMessage(null)}
                  className="text-zinc-400 hover:text-white text-xs font-mono"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono flex items-center justify-between">
            <span>{error}</span>
            <button onClick={onRefresh} className="underline">Retry</button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeMobileTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Harish Stacked Metallic Card */}
            <div className="cred-card cred-metal-red rounded-2xl p-5 relative overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-[#1c1210] to-[#0d0706]">
              <div className="absolute top-2 right-2 text-[9px] font-mono text-[#df8f73]/80 uppercase tracking-widest font-black">
                SOLOARMADA
              </div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                HARISH WINS
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-4xl font-display font-bold text-white">
                  {harishWins} <span className="text-sm font-normal text-zinc-400">({harishWinRatio}%)</span>
                </div>
                <Trophy className="w-6 h-6 text-[#df8f73] opacity-80" />
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Fastest Laps: <strong className="text-white">{harishFastestLaps}</strong></span>
                  <span>DNFs: <strong className="text-red-400">{harishDnfs}</strong></span>
                </div>
                <div className="pt-2 border-t border-white/[0.04]">
                  <span className="text-zinc-500 block mb-1">DOMINANT TRACKS (TOP 3)</span>
                  {harishTopTracks.length === 0 ? (
                    <span className="text-zinc-600 italic">No wins recorded</span>
                  ) : (
                    <div className="space-y-1">
                      {harishTopTracks.map(([track, count], idx) => (
                        <div key={track} className="flex justify-between items-center text-[10px]">
                          <span className="text-zinc-300 truncate max-w-[140px]">{idx + 1}. {track}</span>
                          <span className="text-[#df8f73] font-bold">{count} win{count > 1 ? "s" : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shabesh Stacked Metallic Card */}
            <div className="cred-card cred-metal-cyan rounded-2xl p-5 relative overflow-hidden border border-white/10 shadow-xl bg-gradient-to-br from-[#0e161c] to-[#070b0e]">
              <div className="absolute top-2 right-2 text-[9px] font-mono text-[#94a9b8]/80 uppercase tracking-widest font-black">
                VIATICMONK
              </div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                SHABESH WINS
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-4xl font-display font-bold text-white">
                  {shabeshWins} <span className="text-sm font-normal text-zinc-400">({shabeshWinRatio}%)</span>
                </div>
                <Trophy className="w-6 h-6 text-[#94a9b8] opacity-80" />
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-[10px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Fastest Laps: <strong className="text-white">{shabeshFastestLaps}</strong></span>
                  <span>DNFs: <strong className="text-cyan-400">{shabeshDnfs}</strong></span>
                </div>
                <div className="pt-2 border-t border-white/[0.04]">
                  <span className="text-zinc-500 block mb-1">DOMINANT TRACKS (TOP 3)</span>
                  {shabeshTopTracks.length === 0 ? (
                    <span className="text-zinc-600 italic">No wins recorded</span>
                  ) : (
                    <div className="space-y-1">
                      {shabeshTopTracks.map(([track, count], idx) => (
                        <div key={track} className="flex justify-between items-center text-[10px]">
                          <span className="text-zinc-300 truncate max-w-[140px]">{idx + 1}. {track}</span>
                          <span className="text-[#94a9b8] font-bold">{count} win{count > 1 ? "s" : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Win Ratio Bar */}
            <div className="bg-[#141418]/60 backdrop-blur-xl border border-white/15 rounded-xl p-4 shadow-2xl">
              <div className="flex justify-between text-[10px] font-mono text-zinc-300 mb-1.5 uppercase tracking-wider">
                <span className="text-[#df8f73] font-bold">Harish {harishWinRatio}%</span>
                <span>Head-to-Head Win Share ({totalRaces} Races)</span>
                <span className="text-[#94a9b8] font-bold">Shabesh {shabeshWinRatio}%</span>
              </div>
              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden flex border border-white/10">
                <div style={{ width: `${harishWinRatio}%` }} className="bg-gradient-to-r from-red-600 to-[#df8f73] transition-all duration-500" />
                <div style={{ width: `${shabeshWinRatio}%` }} className="bg-gradient-to-r from-[#94a9b8] to-cyan-500 transition-all duration-500" />
              </div>
            </div>

            {/* Streak Banner */}
            {currentStreakPlayer && streakValue > 0 && (
              <div className="rounded-xl bg-[#141418]/60 backdrop-blur-xl border border-[#c5a880]/50 p-3.5 flex items-center gap-3 shadow-2xl">
                <div className="w-9 h-9 rounded-lg bg-[#c5a880] text-black flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-[8px] font-mono text-[#c5a880] font-bold uppercase tracking-widest">
                    ACTIVE HEATER
                  </div>
                  <div className="text-xs font-display font-medium text-white">
                    <strong className={currentStreakPlayer === "Harish" ? "text-[#df8f73]" : "text-[#94a9b8]"}>
                      {currentStreakPlayer === "Harish" ? "SOLOARMADA (Harish)" : "VIATICMONK (Shabesh)"}
                    </strong>{" "}
                    is on a <span className="text-[#c5a880] font-bold">{streakValue}-race streak</span> 🔥
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#141418]/60 backdrop-blur-xl border border-white/15 rounded-xl p-3.5 shadow-2xl">
                <span className="text-[8px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">TOTAL RACES</span>
                <div className="text-2xl font-display font-medium text-white mt-1">{totalRaces}</div>
              </div>
              <div className="bg-[#141418]/60 backdrop-blur-xl border border-white/15 rounded-xl p-3.5 shadow-2xl">
                <span className="text-[8px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">FASTEST LAPS</span>
                <div className="text-xs font-mono text-zinc-200 mt-1 flex justify-between">
                  <span>H: <strong className="text-[#df8f73]">{harishFastestLaps}</strong></span>
                  <span>S: <strong className="text-[#94a9b8]">{shabeshFastestLaps}</strong></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: LOG RACE */}
        {activeMobileTab === "log" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="cred-card cred-metal-gold rounded-2xl p-4 sm:p-6 border border-white/10 shadow-xl bg-gradient-to-br from-[#1a1610] to-[#0a0704]">
              <div className="mb-4 pb-3 border-b border-white/10">
                <div className="text-[8px] font-mono text-[#c5a880] uppercase tracking-widest font-bold">
                  TELEMETRY FORM
                </div>
                <h2 className="text-lg font-display font-medium text-white mt-0.5">
                  Log New Race Result
                </h2>
              </div>
              <RaceLogForm
                onAddRace={async (newRace) => {
                  const success = await onAddRace(newRace);
                  if (success) {
                    setActiveMobileTab("overview");
                  }
                  return success;
                }}
              />
            </div>
          </motion.div>
        )}

        {/* TAB 3: HISTORY */}
        {activeMobileTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                CHRONOLOGICAL LOGS ({filteredHistory.length})
              </span>
              <div className="flex gap-1.5">
                {["All", "F1", "AMS2", "Assetto"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setHistoryFilterGame(g)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all ${
                      historyFilterGame === g
                        ? "bg-[#c5a880] text-black font-bold"
                        : "bg-white/5 text-zinc-400 border border-white/5"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                No matching telemetry logs found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredHistory.map((race) => {
                  const isHarishWin = race.winner === "Harish";
                  return (
                    <div
                      key={race.id}
                      className="bg-[#141418]/60 backdrop-blur-xl border border-white/15 rounded-xl p-3.5 relative overflow-hidden group hover:border-[#c5a880]/30 transition-all shadow-2xl"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mb-1.5">
                        <span>{race.date}</span>
                        <span className="text-zinc-300 bg-white/10 px-2 py-0.5 rounded backdrop-blur-md">{race.game}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-display font-medium text-white">{race.track}</div>
                          <div className="text-[10px] font-mono text-zinc-300 mt-0.5 flex items-center gap-2">
                            <span>Winner: <strong className={isHarishWin ? "text-[#df8f73]" : "text-[#94a9b8]"}>{race.winner}</strong></span>
                            {race.fastestLap && <span>• FL: <strong className="text-amber-400">{race.fastestLapTime}</strong></span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDeleteRace(race.id)}
                            className="p-2 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 transition-colors backdrop-blur-md border border-red-500/20"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: RECORDS */}
        {activeMobileTab === "records" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
              CIRCUIT BENCHMARK RECORDS ({trackRecordsData.length})
            </div>

            {trackRecordsData.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                No telemetry records established yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {trackRecordsData.map((rec) => {
                  const isHarish = rec.recordHolder === "Harish";
                  return (
                    <div
                      key={rec.track}
                      onClick={() => setSelectedRecord({ track: rec.track, game: rec.game })}
                      className="bg-[#141418]/60 backdrop-blur-xl border border-white/15 rounded-xl p-3.5 cursor-pointer hover:border-[#c5a880]/40 transition-all flex items-center justify-between shadow-2xl"
                    >
                      <div>
                        <div className="text-sm font-display font-medium text-white">{rec.track}</div>
                        <div className="text-[9px] font-mono text-zinc-400 mt-0.5">
                          {rec.game} • Set on {rec.date}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-200 mt-1 flex items-center gap-1.5">
                          <span>Holder:</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${rec.recordHolder === "Harish" ? "bg-red-500/25 text-[#df8f73]" : "bg-cyan-500/25 text-[#94a9b8]"}`}>
                            {rec.recordHolder}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-amber-400">{rec.lapTime}</div>
                        <div className="text-[8px] font-mono text-zinc-400 uppercase mt-1 flex items-center justify-end gap-1">
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Track Telemetry Detail Modal if selected */}
      {selectedRecord && (
        <TrackTelemetryDetail
          trackName={selectedRecord.track}
          gameName={selectedRecord.game}
          races={races}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 inset-x-0 z-50 bg-[#141418]/60 backdrop-blur-xl border-t border-white/[0.15] px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveMobileTab("overview")}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
            activeMobileTab === "overview"
              ? "text-[#c5a880] font-bold"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-mono uppercase tracking-wider">Overview</span>
        </button>

        <button
          onClick={() => setActiveMobileTab("log")}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
            activeMobileTab === "log"
              ? "text-[#c5a880] font-bold"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[9px] font-mono uppercase tracking-wider">Log Race</span>
        </button>

        <button
          onClick={() => setActiveMobileTab("history")}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
            activeMobileTab === "history"
              ? "text-[#c5a880] font-bold"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <HistoryIcon className="w-5 h-5" />
          <span className="text-[9px] font-mono uppercase tracking-wider">History</span>
        </button>

        <button
          onClick={() => setActiveMobileTab("records")}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
            activeMobileTab === "records"
              ? "text-[#c5a880] font-bold"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[9px] font-mono uppercase tracking-wider">Records</span>
        </button>
      </nav>
    </div>
  );
}
