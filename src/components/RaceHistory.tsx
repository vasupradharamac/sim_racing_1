import React, { useState } from "react";
import { RaceResult } from "../types";
import { Search, Trash2, Calendar, Compass, RefreshCw, Layers, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RaceHistoryProps {
  races: RaceResult[];
  onDeleteRace: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export default function RaceHistory({ races, onDeleteRace, onRefresh }: RaceHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("All");
  const [selectedWinner, setSelectedWinner] = useState<string>("All");

  // Filtering Logic
  const filteredRaces = races.filter((race) => {
    const matchesSearch =
      race.track.toLowerCase().includes(searchTerm.toLowerCase()) ||
      race.carClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
      race.fastestLapTime.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGame = selectedGame === "All" || race.game === selectedGame;
    const matchesWinner = selectedWinner === "All" || race.winner === selectedWinner;

    return matchesSearch && matchesGame && matchesWinner;
  });

  // Sort by date descending (newest first)
  const sortedRaces = [...filteredRaces].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
    <div className="cred-card cred-card-glow-gold rounded-2xl p-6 relative overflow-hidden border border-white/[0.03]">
      <CornerRivets />
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <span className="text-[10px] font-mono text-[#c5a880] tracking-[0.22em] uppercase font-bold block mb-1">
            HISTORIC RACING REGISTER • CHRONO RECORD
          </span>
          <h2 className="text-2xl font-display font-light text-white tracking-tight flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#c5a880] animate-pulse" />
            Telemetry Ledger
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Chronological, immutable racing telemetry logs from the simulation cockpit.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-[#050506] border border-white/5 hover:border-white/15 rounded-xl text-[10px] font-mono text-zinc-400 hover:text-white transition-all active:scale-[0.98] uppercase tracking-[0.15em] font-bold"
        >
          <RefreshCw className="w-3 h-3 text-[#c5a880] animate-spin-slow" />
          Synchronize Register
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 font-mono text-xs">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input
            type="text"
            placeholder="FILTER BY TRACK, CAR CLASS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#030304]/30 border border-white/[0.05] text-white placeholder-zinc-700 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-zinc-700/50 focus:bg-black/60 text-[10px] tracking-wider transition-all uppercase backdrop-blur-md"
          />
        </div>

        {/* Game Filter */}
        <div>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-[#030304]/30 border border-white/[0.05] text-zinc-500 rounded-xl px-3 py-2.5 focus:outline-none focus:border-zinc-700/50 focus:bg-black/60 text-[10px] cursor-pointer transition-all font-mono tracking-wider backdrop-blur-md"
          >
            <option value="All">ALL SIMULATORS</option>
            <option value="Formula 1">FORMULA 1</option>
            <option value="Assetto Corsa">ASSETTO CORSA</option>
            <option value="Automobilista 2">AUTOMOBILISTA 2</option>
          </select>
        </div>

        {/* Winner Filter */}
        <div>
          <select
            value={selectedWinner}
            onChange={(e) => setSelectedWinner(e.target.value)}
            className="w-full bg-[#030304]/30 border border-white/[0.05] text-zinc-500 rounded-xl px-3 py-2.5 focus:outline-none focus:border-zinc-700/50 focus:bg-black/60 text-[10px] cursor-pointer transition-all font-mono tracking-wider backdrop-blur-md"
          >
            <option value="All">ALL WINNERS</option>
            <option value="Harish">WINNER: HARISH</option>
            <option value="Shabesh">WINNER: SHABESH</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.04] bg-[#030304]/30 backdrop-blur-md">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-white/[0.03] bg-white/[0.01] backdrop-blur-md text-zinc-500 text-[10px] uppercase font-mono tracking-[0.2em]">
              <th className="py-3.5 px-4 font-black">DATE</th>
              <th className="py-3.5 px-4 font-black">TRACK / GAME</th>
              <th className="py-3.5 px-4 font-black">CAR / WEATHER</th>
              <th className="py-3.5 px-4 font-black text-center">WINNER</th>
              <th className="py-3.5 px-4 font-black text-center">GRID SHIFT</th>
              <th className="py-3.5 px-4 font-black text-center">FASTEST LAP</th>
              <th className="py-3.5 px-4 font-black text-right">LAPS & DUR</th>
              <th className="py-3.5 px-4 text-right font-black">DELETE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.01] text-xs text-zinc-300">
            <AnimatePresence mode="popLayout">
              {sortedRaces.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-700 font-mono text-[11px] tracking-widest uppercase font-semibold">
                    No matching telemetry logs found in database.
                  </td>
                </tr>
              ) : (
                sortedRaces.map((race) => {
                  const hStart = race.harishStartingPos !== undefined ? race.harishStartingPos : (race.winner === "Harish" ? 1 : 2);
                  const hFin = race.harishFinishingPos !== undefined ? race.harishFinishingPos : (race.winner === "Harish" ? 1 : 2);
                  const sStart = race.shabeshStartingPos !== undefined ? race.shabeshStartingPos : (race.winner === "Shabesh" ? 1 : 2);
                  const sFin = race.shabeshFinishingPos !== undefined ? race.shabeshFinishingPos : (race.winner === "Shabesh" ? 1 : 2);

                  return (
                    <motion.tr
                      key={race.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.01] transition-all relative group"
                    >
                      {/* Date */}
                      <td className="py-4 px-4 font-mono text-[10px] text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-zinc-700" />
                          {race.date}
                        </div>
                      </td>

                      {/* Track & Game */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-display font-semibold text-white text-xs tracking-tight">{race.track}</div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mt-1">
                            {race.game}
                          </div>
                        </div>
                      </td>

                      {/* Car & Conditions */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-mono text-[10px] text-zinc-400">{race.carClass}</div>
                          <div className="inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-black border border-white/[0.02] text-zinc-600 uppercase tracking-widest mt-1">
                            {race.conditions}
                          </div>
                        </div>
                      </td>

                      {/* Winner */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-[10px] font-mono font-black uppercase tracking-widest rounded border ${
                            race.winner === "Harish"
                              ? "bg-red-500/5 border-red-500/20 text-red-400"
                              : "bg-cyan-400/5 border-cyan-400/20 text-cyan-400"
                          }`}
                        >
                          {race.winner === "Shabesh" ? "ViaticMonk" : race.winner}
                        </span>
                      </td>

                      {/* Grid Position shift column */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col gap-1 font-mono text-[10px] tracking-wider text-zinc-500">
                          <div>
                            <span className="text-red-500 font-bold">SOLO:</span> P{hStart} → P{hFin}
                          </div>
                          <div>
                            <span className="text-cyan-400 font-bold">VIAT:</span> P{sStart} → P{sFin}
                          </div>
                        </div>
                      </td>

                      {/* Fastest Lap Holder & Time */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`text-[9px] font-mono font-black tracking-widest px-1.5 py-0.5 rounded uppercase ${
                              race.fastestLap === "Harish"
                                ? "bg-red-500/5 text-red-400 border border-red-500/10"
                                : "bg-cyan-500/5 text-cyan-400 border border-cyan-400/10"
                            }`}
                          >
                            {race.fastestLap === "Shabesh" ? "ViaticMonk" : race.fastestLap}
                          </span>
                          <span className="text-[10px] font-mono font-extrabold text-white mt-1">
                            {race.fastestLapTime}
                          </span>
                        </div>
                      </td>

                      {/* Laps & Duration */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono text-[10px]">
                          <div className="text-white font-bold">{race.laps !== undefined ? `${race.laps} LAPS` : "-"}</div>
                          <div className="text-zinc-500 text-[9px] mt-0.5">{race.raceDuration ? race.raceDuration : "N/A"}</div>
                        </div>
                      </td>

                      {/* Rescind/Delete action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => onDeleteRace(race.id)}
                          className="p-1.5 text-zinc-700 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
                          title="Delete telemetry record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
