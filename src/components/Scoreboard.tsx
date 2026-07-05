import React from "react";
import { RaceResult } from "../types";
import { Trophy, Flame, Zap, Award, Target, Milestone, Anchor } from "lucide-react";
import { motion } from "motion/react";

interface ScoreboardProps {
  races: RaceResult[];
}

export default function Scoreboard({ races }: ScoreboardProps) {
  // Calculations
  const totalRaces = races.length;
  const harishWins = races.filter((r) => r.winner === "Harish").length;
  const shabeshWins = races.filter((r) => r.winner === "Shabesh").length;

  const harishFastestLaps = races.filter((r) => r.fastestLap === "Harish").length;
  const shabeshFastestLaps = races.filter((r) => r.fastestLap === "Shabesh").length;

  // Win Ratio
  const harishWinRatio = totalRaces > 0 ? Math.round((harishWins / totalRaces) * 100) : 0;
  const shabeshWinRatio = totalRaces > 0 ? Math.round((shabeshWins / totalRaces) * 100) : 0;

  // Streak Calculation (Active streak of consecutive wins)
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

  // Dominant Track
  const getDominantTrack = (player: "Harish" | "Shabesh") => {
    const playerWins = races.filter((r) => r.winner === player);
    if (playerWins.length === 0) return "N/A";
    const trackCounts: Record<string, number> = {};
    playerWins.forEach((r) => {
      let name = r.track;
      if (name.includes("(")) {
        const match = name.match(/\(([^)]+)\)/);
        if (match) name = match[1];
      }
      trackCounts[name] = (trackCounts[name] || 0) + 1;
    });
    return Object.entries(trackCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const harishDominantTrack = getDominantTrack("Harish");
  const shabeshDominantTrack = getDominantTrack("Shabesh");

  // Spinning rotary gauge turbine visual element
  const RotaryTach = () => (
    <div className="relative w-12 h-12 flex items-center justify-center opacity-60 group-hover:opacity-90 transition-opacity duration-500">
      <svg className="w-full h-full animate-[spin_12s_linear_infinite] text-[#c5a880]/40 group-hover:text-[#c5a880]/80 transition-colors" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="0.8" />
        {/* Gear teeth */}
        <path d="M20 1L20 4M20 36L20 39M1 20L4 20M36 20L39 20M6.5 6.5L8.5 8.5M31.5 31.5L33.5 33.5M6.5 33.5L8.5 31.5M31.5 6.5L33.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        {/* Inner rotor spokes */}
        <path d="M20 12 L15 25 L25 25 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <circle cx="20" cy="20" r="2.5" fill="currentColor" />
      </svg>
      {/* Decorative gauge concentric ring */}
      <div className="absolute inset-2 border border-white/5 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
    </div>
  );

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
    <div id="overall-scoreboard" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* ================= HARISH: BRUSHED ROSE-GOLD DIAL (CALIBRE HRH-93) ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="cred-card cred-metal-red cred-card-glow-red rounded-2xl p-6 flex flex-col justify-between min-h-[310px] relative group overflow-hidden border border-white/10 shadow-2xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(223, 143, 115, 0.18) 0%, transparent 60%), linear-gradient(135deg, rgba(18, 11, 8, 0.55) 0%, rgba(6, 3, 2, 0.7) 100%)"
        }}
      >
        <CornerRivets />

        {/* Watch metadata watermarked */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <RotaryTach />
        </div>

        {/* Top Branding Section */}
        <div>
          <span className="text-[10px] font-mono font-bold tracking-[0.22em] text-[#df8f73]/80 uppercase block">
            TELEMETRY MODULE • SENSOR COCKPIT SoloArmada
          </span>
          <h3 className="text-3xl font-display font-light text-white tracking-tight mt-1.5 flex items-center gap-2">
            <span className="luxury-text-gradient-red font-bold font-display tracking-wide">Harish</span>
          </h3>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="h-1 w-1 rounded-full bg-[#df8f73] animate-pulse" />
            <p className="text-[10px] font-mono text-zinc-600 tracking-[0.15em] uppercase">
              COCKPIT READOUT
            </p>
          </div>
        </div>

        {/* Central visual metric */}
        <div className="my-2 relative flex items-baseline">
          {/* Guilloché styled gauge tick rings background */}
          <div className="absolute left-0 right-0 -top-8 -bottom-8 pointer-events-none opacity-10 border border-dashed border-[#df8f73] rounded-full scale-75" />
          
          <div className="flex items-baseline gap-1.5 z-10">
            <span className="text-7xl font-display font-light tracking-tighter text-white">
              {harishWins}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">
              TOTAL WINS
            </span>
          </div>
        </div>

        {/* Embedded stats strip */}
        <div className="border-t border-white/[0.04] pt-4 mt-auto space-y-2.5 font-mono text-[11px] tracking-widest text-zinc-400">
          <div className="flex justify-between items-center">
            <span className="text-zinc-600">WIN RATIO</span>
            <span className="text-[#df8f73] font-bold text-xs">{harishWinRatio}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-600">FASTEST LAPS</span>
            <span className="text-white font-semibold">{harishFastestLaps} SPLITS</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-600">DOMINANT TRACK</span>
            <span className="text-zinc-300 font-medium truncate max-w-[130px]">{harishDominantTrack}</span>
          </div>
        </div>
      </motion.div>

      {/* ================= TELEMETRY MASTER REGULATOR DIAL ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="cred-card cred-metal-gold cred-card-glow-gold rounded-2xl p-6 flex flex-col justify-between min-h-[310px] relative overflow-hidden border border-white/10 shadow-2xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(197, 168, 128, 0.15) 0%, transparent 60%), linear-gradient(135deg, rgba(16, 15, 13, 0.55) 0%, rgba(6, 5, 5, 0.7) 100%)"
        }}
      >
        <CornerRivets />

        <div className="text-center border-b border-white/[0.03] pb-4">
          <span className="text-[10px] font-mono text-[#c5a880] tracking-[0.25em] uppercase font-bold block">
            TELEMETRY STATUS
          </span>
          <h3 className="text-xs font-display font-light text-zinc-300 mt-1 uppercase tracking-widest">
            Total Completed Runs
          </h3>
        </div>

        {/* Dial / Gauge visual interface */}
        <div className="my-3 flex flex-col items-center">
          <div className="w-full max-w-[180px] aspect-video flex flex-col justify-center items-center relative">
            {/* Visual Arc Dial as a fine timepiece scale */}
            <svg className="w-32 h-16 overflow-visible" viewBox="0 0 100 50">
              {/* Scale Ticks */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(197, 168, 128, 0.08)" strokeWidth="1" strokeDasharray="2,3" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
              
              {/* Delicate Gauge Meter Needle resembling a classic blued-steel watch hand */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="url(#dial-grad)" 
                strokeWidth="5" 
                strokeDasharray="126" 
                strokeDashoffset={126 - (126 * (harishWinRatio || 50)) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              
              <defs>
                <linearGradient id="dial-grad" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#df8f73" />
                  <stop offset="50%" stopColor="#c5a880" />
                  <stop offset="100%" stopColor="#94a9b8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 text-center">
              <span className="text-4xl font-display font-light text-white tracking-tighter">
                {totalRaces}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-[0.2em] mt-0.5">
                TOTAL SAVED RACES
              </span>
            </div>
          </div>

          {/* Luxury head-to-head split slide */}
          <div className="w-full space-y-1.5 mt-2">
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
              <span className="text-[#df8f73]">H: {harishWinRatio}%</span>
              <span className="text-[#94a9b8]">S: {shabeshWinRatio}%</span>
            </div>
            <div className="w-full h-[3px] bg-[#030304] rounded-full overflow-hidden flex border border-white/[0.03]">
              {totalRaces === 0 ? (
                <div className="w-full bg-zinc-900 h-full" />
              ) : (
                <>
                  <div style={{ width: `${harishWinRatio}%` }} className="bg-[#df8f73] h-full transition-all duration-1000 ease-out" />
                  <div style={{ width: `${shabeshWinRatio}%` }} className="bg-[#94a9b8] h-full transition-all duration-1000 ease-out" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Streak indicator styled like power reserve (Réserve de Marche) indicator */}
        <div className="bg-[#030304]/60 rounded-xl p-2.5 border border-white/[0.03] flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${streakValue > 0 ? "bg-[#c5a880]/10 text-[#c5a880]" : "bg-zinc-950 text-zinc-800"}`}>
              <Flame className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
                WINNING STREAK
              </span>
              <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-widest">
                Active Streak
              </span>
            </div>
          </div>
          <div className="text-right">
            {streakValue > 0 && currentStreakPlayer ? (
              <span className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-extrabold uppercase tracking-widest ${
                currentStreakPlayer === "Harish" 
                  ? "bg-[#df8f73]/10 border border-[#df8f73]/20 text-[#df8f73]" 
                  : "bg-[#94a9b8]/10 border border-[#94a9b8]/20 text-[#94a9b8]"
              }`}>
                {currentStreakPlayer} +{streakValue}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-semibold">Stagnant</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ================= SHABESH: PLATINUM SKELETON DIAL (CALIBRE SBS-94) ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="cred-card cred-metal-cyan cred-card-glow-cyan rounded-2xl p-6 flex flex-col justify-between min-h-[310px] relative group overflow-hidden border border-white/10 shadow-2xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(148, 169, 184, 0.18) 0%, transparent 60%), linear-gradient(135deg, rgba(10, 11, 13, 0.55) 0%, rgba(3, 4, 5, 0.7) 100%)"
        }}
      >
        <CornerRivets />

        {/* Watch mechanical wheel */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <RotaryTach />
        </div>

        {/* Top Branding Section */}
        <div>
          <span className="text-[10px] font-mono font-bold tracking-[0.22em] text-[#94a9b8]/80 uppercase block">
            TELEMETRY MODULE • SENSOR COCKPIT ViaticMonk
          </span>
          <h3 className="text-3xl font-display font-light text-white tracking-tight mt-1.5 flex items-center gap-2">
            <span className="luxury-text-gradient-cyan font-bold font-display tracking-wide">Shabesh</span>
          </h3>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="h-1 w-1 rounded-full bg-[#94a9b8] animate-pulse" />
            <p className="text-[10px] font-mono text-zinc-600 tracking-[0.15em] uppercase">
              COCKPIT READOUT
            </p>
          </div>
        </div>

        {/* Central wins metric */}
        <div className="my-2 relative flex items-baseline">
          {/* Guilloché background circle */}
          <div className="absolute left-0 right-0 -top-8 -bottom-8 pointer-events-none opacity-10 border border-dashed border-[#94a9b8] rounded-full scale-75" />
          
          <div className="flex items-baseline gap-1.5 z-10">
            <span className="text-7xl font-display font-light tracking-tighter text-white">
              {shabeshWins}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">
              TOTAL WINS
            </span>
          </div>
        </div>

        {/* Embedded stats strip */}
        <div className="border-t border-white/[0.04] pt-4 mt-auto space-y-2.5 font-mono text-[11px] tracking-widest text-zinc-400">
          <div className="flex justify-between items-center">
            <span className="text-zinc-600">WIN RATIO</span>
            <span className="text-[#94a9b8] font-bold text-xs">{shabeshWinRatio}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-600">FASTEST LAPS</span>
            <span className="text-white font-semibold">{shabeshFastestLaps} SPLITS</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-600">DOMINANT TRACK</span>
            <span className="text-zinc-300 font-medium truncate max-w-[130px]">{shabeshDominantTrack}</span>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

