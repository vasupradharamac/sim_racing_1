import React from "react";
import { RaceResult } from "../types";
import { Trophy, Zap, Flame, Award, Percent } from "lucide-react";
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
    // Sort races by date to find chronological streak
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

  // Favorite Game (highest win count for each)
  const getFavoriteGame = (player: "Harish" | "Shabesh") => {
    const playerWins = races.filter((r) => r.winner === player);
    if (playerWins.length === 0) return "N/A";
    const gameCounts: Record<string, number> = {};
    playerWins.forEach((r) => {
      gameCounts[r.game] = (gameCounts[r.game] || 0) + 1;
    });
    return Object.entries(gameCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const harishFavGame = getFavoriteGame("Harish");
  const shabeshFavGame = getFavoriteGame("Shabesh");

  return (
    <div id="overall-scoreboard" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Harish Player Card */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-zinc-900 border-2 border-red-600/30 rounded-2xl p-6 overflow-hidden shadow-2xl shadow-red-950/10 hover:border-red-500/60 transition-colors"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -z-10" />
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-mono text-red-500 tracking-wider uppercase font-bold px-2.5 py-1 bg-red-950/50 rounded-md border border-red-900/30">
              Challenger Red
            </span>
            <h3 className="text-2xl font-sans font-bold text-white mt-2 tracking-tight">Harish</h3>
          </div>
          <div className="bg-red-950/50 p-2.5 rounded-lg border border-red-900/40 text-red-500">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-baseline my-4">
          <span className="text-6xl font-mono font-bold text-white tracking-tighter">
            {harishWins}
          </span>
          <span className="text-sm font-mono text-zinc-500 ml-2 uppercase">Wins</span>
        </div>

        <div className="mt-6 space-y-3.5 border-t border-zinc-800/80 pt-4 text-sm font-mono">
          <div className="flex justify-between text-zinc-400">
            <span>Win Ratio:</span>
            <span className="text-white font-bold">{harishWinRatio}%</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Fastest Laps:</span>
            <span className="text-white font-bold">{harishFastestLaps}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Dominant Game:</span>
            <span className="text-red-400 font-bold max-w-[150px] truncate text-right">
              {harishFavGame}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Head to Head Duel Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl"
      >
        <div className="text-center">
          <span className="text-xs font-mono text-amber-500 tracking-widest uppercase font-bold">
            Live Standings
          </span>
          <h3 className="text-lg font-sans font-semibold text-zinc-300 mt-1">H2H Ratio Split</h3>
        </div>

        {/* Custom Duel Progress Bar */}
        <div className="my-6">
          <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2">
            <span>Harish ({harishWinRatio}%)</span>
            <span>Shabesh ({shabeshWinRatio}%)</span>
          </div>
          <div className="w-full h-4 bg-zinc-850 rounded-full overflow-hidden flex border border-zinc-800">
            {totalRaces === 0 ? (
              <div className="w-full bg-zinc-800 h-full flex items-center justify-center text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                No races registered
              </div>
            ) : (
              <>
                <div
                  style={{ width: `${harishWinRatio}%` }}
                  className="bg-red-600 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                />
                <div
                  style={{ width: `${shabeshWinRatio}%` }}
                  className="bg-cyan-500 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                />
              </>
            )}
          </div>
          <div className="text-center mt-3 text-xs font-mono text-zinc-500">
            Total Matches: <span className="text-zinc-300 font-bold">{totalRaces}</span>
          </div>
        </div>

        {/* Active Streak Indicator */}
        <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${streakValue > 0 ? "text-amber-500 animate-pulse" : "text-zinc-600"}`} />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Hot Streak
            </span>
          </div>
          <div className="text-right">
            {streakValue > 0 && currentStreakPlayer ? (
              <span className={`text-sm font-mono font-bold ${currentStreakPlayer === "Harish" ? "text-red-500" : "text-cyan-400"}`}>
                {currentStreakPlayer} ({streakValue} Wins)
              </span>
            ) : (
              <span className="text-sm font-mono text-zinc-500 uppercase">None</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Shabesh Player Card */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-zinc-900 border-2 border-cyan-600/30 rounded-2xl p-6 overflow-hidden shadow-2xl shadow-cyan-950/10 hover:border-cyan-500/60 transition-colors"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full blur-3xl -z-10" />
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase font-bold px-2.5 py-1 bg-cyan-950/50 rounded-md border border-cyan-900/30">
              Challenger Cyan
            </span>
            <h3 className="text-2xl font-sans font-bold text-white mt-2 tracking-tight">Shabesh</h3>
          </div>
          <div className="bg-cyan-950/50 p-2.5 rounded-lg border border-cyan-900/40 text-cyan-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-baseline my-4">
          <span className="text-6xl font-mono font-bold text-white tracking-tighter">
            {shabeshWins}
          </span>
          <span className="text-sm font-mono text-zinc-500 ml-2 uppercase">Wins</span>
        </div>

        <div className="mt-6 space-y-3.5 border-t border-zinc-800/80 pt-4 text-sm font-mono">
          <div className="flex justify-between text-zinc-400">
            <span>Win Ratio:</span>
            <span className="text-white font-bold">{shabeshWinRatio}%</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Fastest Laps:</span>
            <span className="text-white font-bold">{shabeshFastestLaps}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Dominant Game:</span>
            <span className="text-cyan-400 font-bold max-w-[150px] truncate text-right">
              {shabeshFavGame}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
