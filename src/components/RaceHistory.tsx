import React, { useState } from "react";
import { RaceResult } from "../types";
import { Search, Trash2, Calendar, Trophy, Zap, Compass, Filter, RefreshCw } from "lucide-react";
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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-red-500" />
            Race History Logbook
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            View, search, and manage all head-to-head racing records
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-all active:scale-[0.98]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Database
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 font-mono text-xs">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by track, car class, lap time..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-red-500 text-sm transition-colors"
          />
        </div>

        {/* Game Filter */}
        <div>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500 text-sm cursor-pointer transition-colors"
          >
            <option value="All">All Games</option>
            <option value="Formula 1">Formula 1</option>
            <option value="Assetto Corsa">Assetto Corsa</option>
            <option value="Auto Mobilista 2">Auto Mobilista 2</option>
          </select>
        </div>

        {/* Winner Filter */}
        <div>
          <select
            value={selectedWinner}
            onChange={(e) => setSelectedWinner(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500 text-sm cursor-pointer transition-colors"
          >
            <option value="All">All Winners</option>
            <option value="Harish">Winner: Harish</option>
            <option value="Shabesh">Winner: Shabesh</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-zinc-850 bg-zinc-950">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-400 text-xs uppercase font-mono tracking-wider">
              <th className="py-3 px-4 font-bold">Date</th>
              <th className="py-3 px-4 font-bold">Game / Track</th>
              <th className="py-3 px-4 font-bold">Car Class</th>
              <th className="py-3 px-4 font-bold">Conditions</th>
              <th className="py-3 px-4 font-bold text-center">Winner</th>
              <th className="py-3 px-4 font-bold text-center">Fastest Lap</th>
              <th className="py-3 px-4 font-bold">Laps</th>
              <th className="py-3 px-4 text-right font-bold">Telemetry Clean</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850 text-sm text-zinc-300">
            <AnimatePresence>
              {sortedRaces.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono text-xs">
                    No matching telemetry logs found in the CSV database.
                  </td>
                </tr>
              ) : (
                sortedRaces.map((race) => (
                  <motion.tr
                    key={race.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-zinc-900/60 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                        {race.date}
                      </div>
                    </td>

                    {/* Game & Track */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-white">{race.track}</div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
                          {race.game}
                        </div>
                      </div>
                    </td>

                    {/* Car Class */}
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                      {race.carClass}
                    </td>

                    {/* Conditions */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 text-[10px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {race.conditions}
                      </span>
                    </td>

                    {/* Winner */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          race.winner === "Harish"
                            ? "bg-red-950/30 border-red-800 text-red-400"
                            : "bg-cyan-950/30 border-cyan-800 text-cyan-400"
                        }`}
                      >
                        {race.winner}
                      </span>
                    </td>

                    {/* Fastest Lap Holder & Time */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            race.fastestLap === "Harish"
                              ? "bg-red-950/25 text-red-400"
                              : "bg-cyan-950/25 text-cyan-400"
                          }`}
                        >
                          {race.fastestLap}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-zinc-400 mt-0.5">
                          {race.fastestLapTime}
                        </span>
                      </div>
                    </td>

                    {/* Laps */}
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                      {race.laps !== undefined ? `${race.laps} Laps` : "-"}
                    </td>

                    {/* Delete action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteRace(race.id)}
                        className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-950/20 rounded transition-colors"
                        title="Delete telemetry record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
