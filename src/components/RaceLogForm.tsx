import React, { useState, useEffect } from "react";
import { GameType, GAMES_AND_TRACKS, CONDITIONS, RaceResult } from "../types";
import { isValidTimeFormat } from "../utils";
import { PlusCircle, Info, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RaceLogFormProps {
  onAddRace: (race: Omit<RaceResult, "id">) => Promise<boolean>;
}

export default function RaceLogForm({ onAddRace }: RaceLogFormProps) {
  const [game, setGame] = useState<GameType>("Formula 1");
  const [track, setTrack] = useState<string>("");
  const [carClass, setCarClass] = useState<string>("");
  const [conditions, setConditions] = useState<typeof CONDITIONS[number]>("Dry - Day");
  const [winner, setWinner] = useState<"Harish" | "Shabesh">("Harish");
  const [fastestLap, setFastestLap] = useState<"Harish" | "Shabesh">("Harish");
  const [fastestLapTime, setFastestLapTime] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  
  // Extra fields for Persistent Progress
  const [laps, setLaps] = useState<number>(10);
  const [raceDuration, setRaceDuration] = useState<string>("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-update track selection when game changes
  useEffect(() => {
    const tracks = GAMES_AND_TRACKS[game];
    if (tracks && tracks.length > 0) {
      setTrack(tracks[0]);
    }
  }, [game]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(false);

    // Validate Lap Time Format (e.g. 1:22.453 or 45.321)
    if (!fastestLapTime.trim()) {
      setValidationError("Fastest Lap Time is required.");
      return;
    }
    if (!isValidTimeFormat(fastestLapTime)) {
      setValidationError("Invalid lap time format. Use format like 1:22.453 or 45.221 (numbers/colons/dots).");
      return;
    }

    // Validate Race Duration Format if provided
    if (raceDuration.trim() && !isValidTimeFormat(raceDuration)) {
      setValidationError("Invalid race duration format. Use format like 15:45.320.");
      return;
    }

    setIsSubmitting(true);

    const success = await onAddRace({
      game,
      track,
      carClass: carClass.trim() || "Default Class",
      conditions,
      winner,
      fastestLap,
      fastestLapTime: fastestLapTime.trim(),
      date,
      laps: laps || undefined,
      raceDuration: raceDuration.trim() || undefined,
    });

    setIsSubmitting(false);

    if (success) {
      // Clear specific form states or keep defaults for easy logging
      setCarClass("");
      setFastestLapTime("");
      setRaceDuration("");
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } else {
      setValidationError("Failed to save race result to CSV. Please try again.");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-5">
        <PlusCircle className="w-5 h-5 text-red-500 animate-pulse" />
        <h2 className="text-xl font-bold text-white tracking-tight">Log New Race</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
        {/* Game Selection */}
        <div>
          <label className="block text-zinc-400 font-mono text-xs uppercase mb-1.5 font-bold">
            Sim Game
          </label>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value as GameType)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
          >
            <option value="Formula 1">Formula 1 (2024 Calendar)</option>
            <option value="Assetto Corsa">Assetto Corsa</option>
            <option value="Auto Mobilista 2">Auto Mobilista 2</option>
          </select>
        </div>

        {/* Dynamic Track Selection */}
        <div>
          <label className="block text-zinc-400 font-mono text-xs uppercase mb-1.5 font-bold">
            Track Selection
          </label>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 transition-colors capitalize"
          >
            {GAMES_AND_TRACKS[game]?.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Car Class Text Input */}
        <div>
          <label className="block text-zinc-400 font-mono text-xs uppercase mb-1.5 font-bold">
            Car Class / Model
          </label>
          <input
            type="text"
            placeholder="e.g. F1 2024, GT3 Porsche, Stock Car V8"
            value={carClass}
            onChange={(e) => setCarClass(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Conditions */}
        <div>
          <label className="block text-zinc-400 font-mono text-xs uppercase mb-1.5 font-bold">
            Track Conditions
          </label>
          <select
            value={conditions}
            onChange={(e) => setConditions(e.target.value as any)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Winner Radio Buttons */}
        <div>
          <label className="block text-zinc-400 font-mono text-xs uppercase mb-2 font-bold">
            Race Winner
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-center p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
              winner === "Harish"
                ? "bg-red-950/40 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.15)]"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}>
              <input
                type="radio"
                name="winner"
                value="Harish"
                checked={winner === "Harish"}
                onChange={() => setWinner("Harish")}
                className="sr-only"
              />
              <span className="font-semibold">Harish</span>
            </label>
            <label className={`flex items-center justify-center p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
              winner === "Shabesh"
                ? "bg-cyan-950/40 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}>
              <input
                type="radio"
                name="winner"
                value="Shabesh"
                checked={winner === "Shabesh"}
                onChange={() => setWinner("Shabesh")}
                className="sr-only"
              />
              <span className="font-semibold">Shabesh</span>
            </label>
          </div>
        </div>

        {/* Fastest Lap Radio Buttons */}
        <div>
          <label className="block text-zinc-400 font-mono text-xs uppercase mb-2 font-bold">
            Fastest Lap Holder
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-center p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
              fastestLap === "Harish"
                ? "bg-red-950/40 border-red-500 text-white"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}>
              <input
                type="radio"
                name="fastestLap"
                value="Harish"
                checked={fastestLap === "Harish"}
                onChange={() => setFastestLap("Harish")}
                className="sr-only"
              />
              <span className="font-semibold">Harish</span>
            </label>
            <label className={`flex items-center justify-center p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
              fastestLap === "Shabesh"
                ? "bg-cyan-950/40 border-cyan-500 text-white"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}>
              <input
                type="radio"
                name="fastestLap"
                value="Shabesh"
                checked={fastestLap === "Shabesh"}
                onChange={() => setFastestLap("Shabesh")}
                className="sr-only"
              />
              <span className="font-semibold">Shabesh</span>
            </label>
          </div>
        </div>

        {/* Fastest Lap Time Input */}
        <div>
          <label className="block text-zinc-400 font-mono text-xs uppercase mb-1.5 font-bold">
            Fastest Lap Time
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 1:22.453 or 45.890"
            value={fastestLapTime}
            onChange={(e) => setFastestLapTime(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 font-mono transition-colors"
          />
        </div>

        {/* Number of Laps & Total Race Duration for Persistent Progress */}
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-3">
          <div>
            <label className="block text-zinc-400 font-mono text-xs uppercase mb-1.5 font-bold">
              Lap Count
            </label>
            <input
              type="number"
              min={1}
              value={laps}
              onChange={(e) => setLaps(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 font-mono transition-colors"
            />
          </div>
          <div>
            <label className="block text-zinc-400 font-mono text-xs uppercase mb-1.5 font-bold">
              Race Duration
            </label>
            <input
              type="text"
              placeholder="e.g. 15:45.320"
              value={raceDuration}
              onChange={(e) => setRaceDuration(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-750 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 font-mono transition-colors"
            />
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-zinc-400 font-mono text-xs uppercase mb-1.5 font-bold">
            Race Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 font-mono transition-colors"
          />
        </div>

        {/* Feedback Messages */}
        <AnimatePresence mode="wait">
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-red-400 flex items-start gap-2 text-xs"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-3 text-emerald-400 flex items-center gap-2 text-xs font-mono font-bold"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>RACE RESULT LOGGED SUCCESSFULLY!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-mono uppercase tracking-widest font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-red-900/20 active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Syncing..." : "Submit telemetry"}
        </button>
      </form>
    </div>
  );
}
