import React, { useState, useEffect } from "react";
import { GameType, GAMES_AND_TRACKS, CONDITIONS, RaceResult } from "../types";
import { isValidTimeFormat } from "../utils";
import { PlusCircle, Check, AlertTriangle, Sliders, Calendar, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RaceLogFormProps {
  onAddRace: (race: Omit<RaceResult, "id">) => Promise<boolean>;
}

export default function RaceLogForm({ onAddRace }: RaceLogFormProps) {
  const [game, setGame] = useState<GameType>("Formula 1");
  const [track, setTrack] = useState<string>("");
  const [carClass, setCarClass] = useState<string>("GT3 (Gen1 & Gen2)");
  const [conditions, setConditions] = useState<typeof CONDITIONS[number]>("Dry - Day");
  const [winner, setWinner] = useState<"Harish" | "Shabesh">("Harish");
  const [fastestLap, setFastestLap] = useState<"Harish" | "Shabesh">("Harish");
  const [fastestLapTime, setFastestLapTime] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  
  // Extra fields for Persistent Progress
  const [laps, setLaps] = useState<number | "">(10);
  const [raceDuration, setRaceDuration] = useState<string>("");

  // Grid / Laps Led fields
  const [harishStartingPos, setHarishStartingPos] = useState<number | "">(1);
  const [shabeshStartingPos, setShabeshStartingPos] = useState<number | "">(2);
  const [harishFinishingPos, setHarishFinishingPos] = useState<number | "">(1);
  const [shabeshFinishingPos, setShabeshFinishingPos] = useState<number | "">(2);

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
      laps: laps === "" ? undefined : (laps || undefined),
      raceDuration: raceDuration.trim() || undefined,
      harishStartingPos: harishStartingPos === "" ? 1 : harishStartingPos,
      shabeshStartingPos: shabeshStartingPos === "" ? 2 : shabeshStartingPos,
      harishFinishingPos: harishFinishingPos === "" ? 1 : harishFinishingPos,
      shabeshFinishingPos: shabeshFinishingPos === "" ? 2 : shabeshFinishingPos
    });

    setIsSubmitting(false);

    if (success) {
      // Clear specific form states or keep defaults for easy logging
      setCarClass("GT3 (Gen1 & Gen2)");
      setFastestLapTime("");
      setRaceDuration("");
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } else {
      setValidationError("Failed to save race result. Please try again.");
    }
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
    <div className="cred-card cred-card-glow-gold rounded-2xl p-6 relative overflow-hidden border border-white/[0.03]">
      <CornerRivets />
      
      <div className="flex flex-col mb-6 border-b border-white/[0.02] pb-4 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <PlusCircle className="w-3.5 h-3.5 text-[#c5a880] animate-pulse" />
          <span className="text-[8px] font-mono font-bold text-[#c5a880] uppercase tracking-[0.22em] block">
            PILOT ENTRY STATION
          </span>
        </div>
        <h3 className="text-lg font-display font-light text-white tracking-tight">
          Log New Race Result
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 font-sans text-xs">
        
        {/* Game Selection */}
        <div>
          <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
            Sim Game
          </label>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value as GameType)}
            className="w-full cred-input-premium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 font-mono transition-colors text-[11px]"
          >
            <option value="Formula 1">Formula 1 (2024 Calendar)</option>
            <option value="Assetto Corsa">Assetto Corsa</option>
            <option value="Automobilista 2">Automobilista 2</option>
          </select>
        </div>

        {/* Dynamic Track Selection */}
        <div>
          <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
            Track Selection
          </label>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="w-full cred-input-premium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 font-mono transition-colors capitalize text-[11px]"
          >
            {GAMES_AND_TRACKS[game]?.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Car Class Dropdown */}
        <div>
          <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
            Car Class / Model
          </label>
          <select
            value={carClass}
            onChange={(e) => setCarClass(e.target.value)}
            className="w-full cred-input-premium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 font-mono transition-colors text-[11px]"
          >
            <optgroup label="GT & Sports Cars">
              <option value="GT1">GT1</option>
              <option value="GT3 (Gen1 & Gen2)">GT3 (Gen1 & Gen2)</option>
              <option value="GT4">GT4</option>
              <option value="GTE">GTE</option>
            </optgroup>
            <optgroup label="Prototypes">
              <option value="LMP2">LMP2</option>
              <option value="LMP1">LMP1</option>
            </optgroup>
            <optgroup label="Formula 1">
              <option value="Formula 1">Formula 1</option>
            </optgroup>
          </select>
        </div>

        {/* Conditions */}
        <div>
          <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
            Track Conditions
          </label>
          <select
            value={conditions}
            onChange={(e) => setConditions(e.target.value as any)}
            className="w-full cred-input-premium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 font-mono transition-colors text-[11px]"
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
          <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
            Race Winner
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-center py-2.5 rounded-xl border cursor-pointer transition-all ${
              winner === "Harish"
                ? "bg-[#0c0505] border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.06)]"
                : "bg-black border-white/[0.01] text-zinc-600 hover:border-white/5"
            }`}>
              <input
                type="radio"
                name="winner"
                value="Harish"
                checked={winner === "Harish"}
                onChange={() => {
                  setWinner("Harish");
                  setHarishFinishingPos(1);
                  setShabeshFinishingPos(2);
                }}
                className="sr-only"
              />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em]">SoloArmada</span>
            </label>
            <label className={`flex items-center justify-center py-2.5 rounded-xl border cursor-pointer transition-all ${
              winner === "Shabesh"
                ? "bg-[#050c0e] border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                : "bg-black border-white/[0.01] text-zinc-600 hover:border-white/5"
            }`}>
              <input
                type="radio"
                name="winner"
                value="Shabesh"
                checked={winner === "Shabesh"}
                onChange={() => {
                  setWinner("Shabesh");
                  setShabeshFinishingPos(1);
                  setHarishFinishingPos(2);
                }}
                className="sr-only"
              />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em]">ViaticMonk</span>
            </label>
          </div>
        </div>

        {/* Detailed Competitor Grid & Finishing Positions */}
        <div className="border-t border-white/[0.02] pt-4 mt-2 space-y-3">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-500 font-mono uppercase tracking-[0.2em]">
            <Sliders className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Grid & Finishing Positions</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Harish Detailed Stats */}
            <div className="bg-black/60 border border-white/[0.01] p-3 rounded-xl space-y-2.5">
              <span className="text-[9px] font-mono font-black text-red-500 block uppercase tracking-[0.18em]">SoloArmada</span>
              <div>
                <label className="block text-[8px] text-zinc-500 font-mono uppercase mb-1 tracking-wider">Starting Pos</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = harishStartingPos === "" ? 1 : harishStartingPos;
                      if (cur > 1) setHarishStartingPos(cur - 1);
                    }}
                    className="px-2.5 py-1.5 bg-[#0a0a0d] hover:bg-[#1a1a24] text-[#c5a880]/80 hover:text-[#c5a880] border border-white/5 rounded-l-lg font-mono text-xs transition-colors cursor-pointer select-none"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={harishStartingPos}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setHarishStartingPos("");
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) setHarishStartingPos(parsed);
                      }
                    }}
                    className="w-full text-center bg-[#030304]/45 border border-white/5 py-1.5 focus:outline-none font-mono text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = harishStartingPos === "" ? 0 : harishStartingPos;
                      setHarishStartingPos(cur + 1);
                    }}
                    className="px-2.5 py-1.5 bg-[#0a0a0d] hover:bg-[#1a1a24] text-[#c5a880]/80 hover:text-[#c5a880] border border-white/5 rounded-r-lg font-mono text-xs transition-colors cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[8px] text-zinc-500 font-mono uppercase mb-1 tracking-wider font-semibold">Finishing Pos</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = harishFinishingPos === "" ? 1 : harishFinishingPos;
                      if (cur > 1) {
                        const nextVal = cur - 1;
                        setHarishFinishingPos(nextVal);
                        const shabeshPos = shabeshFinishingPos === "" ? 2 : shabeshFinishingPos;
                        if (nextVal < shabeshPos) {
                          setWinner("Harish");
                        } else if (nextVal > shabeshPos) {
                          setWinner("Shabesh");
                        }
                      }
                    }}
                    className="px-2.5 py-1.5 bg-[#0a0a0d] hover:bg-[#1a1a24] text-[#c5a880]/80 hover:text-[#c5a880] border border-white/5 rounded-l-lg font-mono text-xs transition-colors cursor-pointer select-none"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={harishFinishingPos}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setHarishFinishingPos("");
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) {
                          setHarishFinishingPos(parsed);
                          const shabeshPos = shabeshFinishingPos === "" ? 2 : shabeshFinishingPos;
                          if (parsed < shabeshPos) {
                            setWinner("Harish");
                          } else if (parsed > shabeshPos) {
                            setWinner("Shabesh");
                          }
                        }
                      }
                    }}
                    className="w-full text-center bg-[#030304]/45 border border-white/5 py-1.5 focus:outline-none font-mono text-xs text-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = harishFinishingPos === "" ? 0 : harishFinishingPos;
                      const nextVal = cur + 1;
                      setHarishFinishingPos(nextVal);
                      const shabeshPos = shabeshFinishingPos === "" ? 2 : shabeshFinishingPos;
                      if (nextVal < shabeshPos) {
                        setWinner("Harish");
                      } else if (nextVal > shabeshPos) {
                        setWinner("Shabesh");
                      }
                    }}
                    className="px-2.5 py-1.5 bg-[#0a0a0d] hover:bg-[#1a1a24] text-[#c5a880]/80 hover:text-[#c5a880] border border-white/5 rounded-r-lg font-mono text-xs transition-colors cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Shabesh Detailed Stats */}
            <div className="bg-black/60 border border-white/[0.01] p-3 rounded-xl space-y-2.5">
              <span className="text-[9px] font-mono font-black text-cyan-400 block uppercase tracking-[0.18em]">ViaticMonk</span>
              <div>
                <label className="block text-[8px] text-zinc-500 font-mono uppercase mb-1 tracking-wider">Starting Pos</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = shabeshStartingPos === "" ? 1 : shabeshStartingPos;
                      if (cur > 1) setShabeshStartingPos(cur - 1);
                    }}
                    className="px-2.5 py-1.5 bg-[#0a0a0d] hover:bg-[#1a1a24] text-[#c5a880]/80 hover:text-[#c5a880] border border-white/5 rounded-l-lg font-mono text-xs transition-colors cursor-pointer select-none"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={shabeshStartingPos}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setShabeshStartingPos("");
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) setShabeshStartingPos(parsed);
                      }
                    }}
                    className="w-full text-center bg-[#030304]/45 border border-white/5 py-1.5 focus:outline-none font-mono text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = shabeshStartingPos === "" ? 0 : shabeshStartingPos;
                      setShabeshStartingPos(cur + 1);
                    }}
                    className="px-2.5 py-1.5 bg-[#0a0a0d] hover:bg-[#1a1a24] text-[#c5a880]/80 hover:text-[#c5a880] border border-white/5 rounded-r-lg font-mono text-xs transition-colors cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[8px] text-zinc-500 font-mono uppercase mb-1 tracking-wider font-semibold">Finishing Pos</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = shabeshFinishingPos === "" ? 1 : shabeshFinishingPos;
                      if (cur > 1) {
                        const nextVal = cur - 1;
                        setShabeshFinishingPos(nextVal);
                        const harishPos = harishFinishingPos === "" ? 1 : harishFinishingPos;
                        if (nextVal < harishPos) {
                          setWinner("Shabesh");
                        } else if (nextVal > harishPos) {
                          setWinner("Harish");
                        }
                      }
                    }}
                    className="px-2.5 py-1.5 bg-[#0a0a0d] hover:bg-[#1a1a24] text-[#c5a880]/80 hover:text-[#c5a880] border border-white/5 rounded-l-lg font-mono text-xs transition-colors cursor-pointer select-none"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={shabeshFinishingPos}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setShabeshFinishingPos("");
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) {
                          setShabeshFinishingPos(parsed);
                          const harishPos = harishFinishingPos === "" ? 1 : harishFinishingPos;
                          if (parsed < harishPos) {
                            setWinner("Shabesh");
                          } else if (parsed > harishPos) {
                            setWinner("Harish");
                          }
                        }
                      }
                    }}
                    className="w-full text-center bg-[#030304]/45 border border-white/5 py-1.5 focus:outline-none font-mono text-xs text-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = shabeshFinishingPos === "" ? 0 : shabeshFinishingPos;
                      const nextVal = cur + 1;
                      setShabeshFinishingPos(nextVal);
                      const harishPos = harishFinishingPos === "" ? 1 : harishFinishingPos;
                      if (nextVal < harishPos) {
                        setWinner("Shabesh");
                      } else if (nextVal > harishPos) {
                        setWinner("Harish");
                      }
                    }}
                    className="px-2.5 py-1.5 bg-[#0a0a0d] hover:bg-[#1a1a24] text-[#c5a880]/80 hover:text-[#c5a880] border border-white/5 rounded-r-lg font-mono text-xs transition-colors cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fastest Lap Radio Buttons */}
        <div>
          <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
            Fastest Lap Holder
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-center py-2.5 rounded-xl border cursor-pointer transition-all ${
              fastestLap === "Harish"
                ? "bg-[#0c0505] border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.06)]"
                : "bg-black border-white/[0.01] text-zinc-600 hover:border-white/5"
            }`}>
              <input
                type="radio"
                name="fastestLap"
                value="Harish"
                checked={fastestLap === "Harish"}
                onChange={() => setFastestLap("Harish")}
                className="sr-only"
              />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em]">SoloArmada</span>
            </label>
            <label className={`flex items-center justify-center py-2.5 rounded-xl border cursor-pointer transition-all ${
              fastestLap === "Shabesh"
                ? "bg-[#050c0e] border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                : "bg-black border-white/[0.01] text-zinc-600 hover:border-white/5"
            }`}>
              <input
                type="radio"
                name="fastestLap"
                value="Shabesh"
                checked={fastestLap === "Shabesh"}
                onChange={() => setFastestLap("Shabesh")}
                className="sr-only"
              />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em]">ViaticMonk</span>
            </label>
          </div>
        </div>

        {/* Fastest Lap Time Input */}
        <div>
          <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
            Fastest Lap Time
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 1:22.453 or 45.890"
            value={fastestLapTime}
            onChange={(e) => setFastestLapTime(e.target.value)}
            className="w-full cred-input-premium placeholder-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 font-mono transition-colors text-[11px]"
          />
        </div>

        {/* Number of Laps & Total Race Duration for Persistent Progress */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/[0.02] pt-3">
          <div>
            <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
              Lap Count
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={laps}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setLaps("");
                } else {
                  const parsed = parseInt(val, 10);
                  if (!isNaN(parsed)) setLaps(parsed);
                }
              }}
              className="w-full cred-input-premium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 font-mono transition-colors text-[11px]"
            />
          </div>
          <div>
            <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
              Race Duration
            </label>
            <input
              type="text"
              placeholder="e.g. 15:45.320"
              value={raceDuration}
              onChange={(e) => setRaceDuration(e.target.value)}
              className="w-full cred-input-premium placeholder-zinc-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 font-mono transition-colors text-[11px]"
            />
          </div>
        </div>

        {/* Race Date Selector */}
        <div>
          <label className="block text-zinc-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-2 font-bold">
            Race Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full cred-input-premium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 font-mono transition-colors text-[11px]"
          />
        </div>

        {/* Feedback Messages */}
        <AnimatePresence mode="wait">
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-950/20 border border-red-900/40 rounded-xl p-3 text-red-400 flex items-start gap-2 text-[10px] font-mono uppercase tracking-wider"
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 text-emerald-400 flex items-center gap-2 text-[10px] font-mono font-bold tracking-wider uppercase"
            >
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              <span>LOGGED SUCCESSFULLY!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button (CRED Primary White Style) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="cred-btn-primary w-full py-3.5 rounded-xl uppercase tracking-[0.2em] text-[10px] font-black font-display cursor-pointer select-none transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {isSubmitting ? "SYNCING..." : "SUBMIT TELEMETRY"}
        </button>
      </form>
    </div>
  );
}
