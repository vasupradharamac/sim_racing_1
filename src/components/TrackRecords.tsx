import React, { useState } from "react";
import { RaceResult, GameType, GAMES_AND_TRACKS } from "../types";
import { parseTimeToSeconds, getTrackLengthKM } from "../utils";
import { Search, Trophy, Timer, Eye, Milestone, Compass, Activity, Target } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TrackTelemetryDetail from "./TrackTelemetryDetail";

interface TrackRecordsProps {
  races: RaceResult[];
}

export default function TrackRecords({ races }: TrackRecordsProps) {
  const [selectedGame, setSelectedGame] = useState<GameType>("Formula 1");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTrackDetail, setActiveTrackDetail] = useState<{ trackName: string; gameName: string } | null>(null);

  const tracksInGame = GAMES_AND_TRACKS[selectedGame] || [];

  // Find fastest lap record for each track in the database
  const getTrackRecord = (trackName: string) => {
    const trackRaces = races.filter((r) => r.track === trackName && r.game === selectedGame);
    if (trackRaces.length === 0) return null;

    return trackRaces.reduce((best, current) => {
      const bestSec = parseTimeToSeconds(best.fastestLapTime);
      const currentSec = parseTimeToSeconds(current.fastestLapTime);
      return currentSec < bestSec ? current : best;
    });
  };

  const records = tracksInGame.map((track) => {
    const record = getTrackRecord(track);
    const lengthKM = getTrackLengthKM(track);
    return {
      trackName: track,
      record,
      lengthKM
    };
  });

  // Filter records based on search query and ensure we only display tracks that actually have records
  const filteredRecords = records.filter((r) =>
    r.record !== null && r.trackName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute record share count for active game
  const activeRecords = records.filter((r) => r.record !== null);
  const totalActiveRecords = activeRecords.length;
  const harishRecordCount = activeRecords.filter((r) => r.record?.fastestLap === "Harish").length;
  const shabeshRecordCount = activeRecords.filter((r) => r.record?.fastestLap === "Shabesh").length;

  const harishSharePercent = totalActiveRecords > 0 ? Math.round((harishRecordCount / totalActiveRecords) * 100) : 0;
  const shabeshSharePercent = totalActiveRecords > 0 ? Math.round((shabeshRecordCount / totalActiveRecords) * 100) : 0;

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
    <div className="cred-card cred-card-glow-gold rounded-2xl p-6 relative overflow-hidden border border-white/[0.03]">
      <CornerRivets />
      
      {/* Header and Telemetry Distribution Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-white/[0.02] pb-6 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-[#c5a880] animate-pulse" />
            <span className="text-[10px] font-mono font-black text-[#c5a880] uppercase tracking-[0.25em]">
              TELEMETRY REGISTRY • RECORDS ENGINE
            </span>
          </div>
          <h2 className="text-2xl font-display font-light text-white tracking-tight">
            Ultimate Circuit Records
          </h2>
          <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase mt-1">
            EXQUISITE TELEMETRY LAPTIME REGISTER FOR TRACK RECORDS.
          </p>
        </div>

        {/* Dynamic distribution of record share inside game */}
        {totalActiveRecords > 0 && (
          <div className="w-full xl:w-72 bg-[#030304]/80 border border-white/[0.03] p-3 rounded-xl space-y-1.5 relative overflow-hidden">
            <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-800" />
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 font-bold tracking-widest uppercase">
              <span>RECORD BALANCE</span>
              <span className="text-zinc-300">
                <span className="text-[#df8f73]">H: {harishRecordCount}</span> / <span className="text-[#94a9b8]">S: {shabeshRecordCount}</span>
              </span>
            </div>
            <div className="w-full h-[3px] bg-black rounded-full overflow-hidden flex">
              <div style={{ width: `${harishSharePercent}%` }} className="bg-[#df8f73] transition-all duration-700" />
              <div style={{ width: `${shabeshSharePercent}%` }} className="bg-[#94a9b8] transition-all duration-700" />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-600 tracking-widest">
              <span>HARISH ({harishSharePercent}%)</span>
              <span>SHABESH ({shabeshSharePercent}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Selector and Search Bar Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 relative z-10">
        {/* Game Switcher Tabs */}
        <div className="flex-grow flex bg-[#030304]/30 border border-white/[0.05] rounded-xl p-1 overflow-x-auto no-scrollbar backdrop-blur-md">
          {(["Formula 1", "Assetto Corsa", "Automobilista 2"] as GameType[]).map((game) => (
            <button
              key={game}
              onClick={() => {
                setSelectedGame(game);
                setSearchQuery("");
              }}
              className={`flex-grow px-4 py-2.5 rounded-lg font-mono text-[11px] font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap cursor-pointer ${
                selectedGame === game
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {game}
            </button>
          ))}
        </div>

        {/* Luxury Search Input */}
        <div className="relative lg:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="FILTER BY CIRCUIT NAME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#030304]/30 border border-white/[0.05] text-white placeholder-zinc-700 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-zinc-700/50 focus:bg-black/60 font-mono text-[11px] tracking-widest transition-all uppercase backdrop-blur-md"
          />
        </div>
      </div>

      {/* Hologram cards layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((item, idx) => {
            const hasRecord = item.record !== null;
            const recordHolder = item.record?.fastestLap;
            const recordTime = item.record?.fastestLapTime;
            const recordCarClass = item.record?.carClass;
            const recordDate = item.record?.date;

            return (
              <motion.div
                key={item.trackName}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.02, cubicBezier: [0.16, 1, 0.3, 1] }}
                onClick={() => {
                  if (hasRecord) {
                    setActiveTrackDetail({ trackName: item.trackName, gameName: selectedGame });
                  }
                }}
                className={`bg-[#030304]/40 backdrop-blur-md border relative overflow-hidden select-none ${
                  hasRecord 
                    ? recordHolder === "Harish"
                      ? "border-[#df8f73]/15 hover:border-[#df8f73]/40 shadow-[0_0_20px_rgba(223,143,115,0.02)] cursor-pointer"
                      : "border-[#94a9b8]/15 hover:border-[#94a9b8]/40 shadow-[0_0_20px_rgba(148,169,184,0.02)] cursor-pointer"
                    : "border-white/[0.02] hover:border-white/[0.06]"
                } rounded-xl p-4.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 group`}
              >
                {/* Decorative scale screw on single register */}
                <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-zinc-800/80" />

                {/* Track Title and KM length */}
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-display text-base text-zinc-100 tracking-tight leading-tight group-hover:text-[#c5a880] transition-colors">
                      {item.trackName}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase flex-shrink-0 tracking-wider">
                      {item.lengthKM.toFixed(3)} KM
                    </span>
                  </div>
                </div>

                {/* Main sector records card */}
                {hasRecord ? (
                  <div className="mt-4 border-t border-white/[0.03] pt-4 relative">
                    {/* Concentric circle watermark behind the laptime */}
                    <div className="absolute right-0 -bottom-2 w-12 h-12 rounded-full border border-dashed border-white/[0.02] scale-125 pointer-events-none" />

                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-400/80" /> CERTIFIED RECORD
                      </span>
                      <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${recordHolder === "Harish" ? "text-[#df8f73]" : "text-[#94a9b8]"}`}>
                        {recordHolder === "Harish" ? "Harish (SoloArmada)" : "ViaticMonk"}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-[#c5a880]" />
                        <span className="text-2xl font-mono font-light tracking-tighter text-white">
                          {recordTime}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase truncate max-w-[120px]" title={recordCarClass}>
                        {recordCarClass}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-3 pt-2.5 border-t border-white/[0.01]">
                      <span>ID #{item.record?.id.slice(0, 4).toUpperCase()}</span>
                      <span className="text-[#c5a880] flex items-center gap-1 font-bold group-hover:underline">
                        <Eye className="w-3.5 h-3.5" /> ANALYZE TELEMETRY
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 border-t border-white/[0.03] pt-4 flex flex-col justify-center items-center py-5 text-center bg-black/40 rounded-xl border border-white/[0.01]">
                    <Compass className="w-5 h-5 text-zinc-800 mb-1.5 animate-[spin_12s_linear_infinite]" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                      CIRCUIT RECORD VACANT
                    </span>
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-0.5">
                      Submit telemetry to establish benchmark
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12 bg-[#030304]/60 border border-white/[0.02] rounded-2xl font-mono text-xs tracking-widest uppercase text-zinc-500 p-8">
          {searchQuery ? (
            <span>No circuits match your search criteria. Try a different query.</span>
          ) : (
            <div className="max-w-md mx-auto space-y-2">
              <span className="block text-zinc-400 font-bold">No circuit records established for {selectedGame} yet.</span>
              <span className="block text-[10px] text-zinc-600">Submit new race telemetry using the log form to set the benchmark lap time.</span>
            </div>
          )}
        </div>
      )}

      {/* Exquisite interactive telemetry detail modal dialog */}
      <AnimatePresence>
        {activeTrackDetail && (
          <TrackTelemetryDetail
            trackName={activeTrackDetail.trackName}
            gameName={activeTrackDetail.gameName}
            races={races}
            onClose={() => setActiveTrackDetail(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
