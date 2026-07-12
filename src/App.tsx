import React, { useState, useEffect } from "react";
import { RaceResult } from "./types";
import { getCelebratoryMessage } from "./utils";
import Scoreboard from "./components/Scoreboard";
import RaceLogForm from "./components/RaceLogForm";
import RaceHistory from "./components/RaceHistory";
import TrackRecords from "./components/TrackRecords";
import PersistentProgress from "./components/PersistentProgress";
import PaganiRpmGauge from "./components/PaganiRpmGauge";
import MobileApp from "./components/MobileApp";
import { Shield, Gauge, RefreshCw, Trophy, LayoutDashboard, PlusCircle, History } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import carBg from "./assets/images/gtr_bg_artsy_1783078522650.jpg";

export default function App() {
  const [races, setRaces] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [celebratoryMessage, setCelebratoryMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "log">("dashboard");

  // Fetch races from the Express CSV backend
  const fetchRaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/races");
      if (!res.ok) {
        throw new Error("Failed to load race data");
      }
      const data = await res.json();
      setRaces(data);
    } catch (e: any) {
      console.error(e);
      setError("Unable to connect to the racing database. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  // Post new race and update local state
  const handleAddRace = async (newRace: Omit<RaceResult, "id">): Promise<boolean> => {
    try {
      const currentRaces = [...races];
      const res = await fetch("/api/races", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRace),
      });

      if (!res.ok) {
        throw new Error("Failed to save race result");
      }

      const updatedRaces = await res.json();
      const addedRaceObj = updatedRaces[updatedRaces.length - 1] || { ...newRace, id: "temp" };
      const msg = getCelebratoryMessage(addedRaceObj, currentRaces, updatedRaces);
      setCelebratoryMessage(msg);

      setRaces(updatedRaces);
      setActiveTab("dashboard"); // Switch back to dashboard to display updated results first
      return true;
    } catch (e) {
      console.error("Error adding race:", e);
      return false;
    }
  };


  // Delete race by ID
  const handleDeleteRace = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this race record? This will permanently remove it from the database.")) {
      return;
    }

    try {
      const res = await fetch(`/api/races/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete race record");
      }

      const updatedRaces = await res.json();
      setRaces(updatedRaces);
    } catch (e) {
      console.error("Error deleting race:", e);
      alert("Failed to delete the race record. Please try again.");
    }
  };

  return (
    <>
      {/* Mobile Redesigned View */}
      <div className="block md:hidden">
        <MobileApp
          races={races}
          onAddRace={handleAddRace}
          onDeleteRace={handleDeleteRace}
          onRefresh={fetchRaces}
          loading={loading}
          error={error}
          celebratoryMessage={celebratoryMessage}
          setCelebratoryMessage={setCelebratoryMessage}
        />
      </div>

      {/* Desktop Original Layout */}
      <div className="hidden md:flex min-h-screen bg-[#141418] text-zinc-100 flex-col selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Upper Subtle Golden Thin Accenting Bar */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#c5a880]/30 to-transparent relative z-10" />

      {/* Seamlessly Integrated Artsy Automotive Background */}
      <div className="fixed inset-y-0 left-0 w-full md:w-[60vw] max-w-[850px] pointer-events-none z-0 overflow-hidden select-none">
        {/* Ambient background image */}
        <motion.img
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.58, scale: 1.01 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          src={carBg}
          alt="Sim Racing Telemetry Ambient Art"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        {/* Multi-layered custom gradient masks for extreme seamlessness */}
        {/* Left edge deep fade */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#141418] to-transparent" />
        {/* Right edge absolute fade */}
        <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-[#141418] via-[#141418]/80 to-transparent" />
        {/* Bottom edge absolute fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#141418] via-[#141418]/75 to-transparent" />
        {/* Top edge absolute fade */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#141418] via-[#141418]/45 to-transparent" />
        {/* Global ambient radial blur/blend - softer dark vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,transparent_20%,rgba(20,20,24,0.35)_50%,#141418_100%)]" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-12 flex-grow relative z-10">
        {/* Header section with ultra-luxurious, minimalist styling */}
        <header className="mb-4 md:mb-8 border-b border-white/[0.02] pb-4 md:pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="scale-90 origin-left sm:scale-100">
              <PaganiRpmGauge />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[7px] sm:text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-[0.2em]">
                  TELEMETRY READOUT
                </span>
                <span className="text-[7px] sm:text-[8px] font-mono text-zinc-600">
                  EST. 2026
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-display font-light text-white tracking-tight mt-1">
                PERFORMANCE DIALS <span className="font-sans font-extrabold text-lg sm:text-2xl text-[#c5a880] tracking-normal block sm:inline sm:ml-2">H2H TELEMETRY</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden xs:inline">DB SYNCHRONIZED:</span>
            <span className="text-zinc-300 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
              racing_data.csv
            </span>
          </div>
        </header>

        {/* Tab Navigation Bar */}
        {!loading && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/[0.08] mb-4 md:mb-8 pb-3 md:pb-4 gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 sm:px-6 sm:py-3 rounded-xl font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all ${
                  activeTab === "dashboard"
                    ? "bg-[#c5a880] text-black font-bold shadow-lg shadow-[#c5a880]/20"
                    : "bg-[#141418]/60 backdrop-blur-xl text-zinc-300 hover:text-white border border-white/15"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Performance Dashboard
              </button>
              <button
                onClick={() => setActiveTab("log")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 sm:px-6 sm:py-3 rounded-xl font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all ${
                  activeTab === "log"
                    ? "bg-[#c5a880] text-black font-bold shadow-lg shadow-[#c5a880]/20"
                    : "bg-[#141418]/60 backdrop-blur-xl text-zinc-300 hover:text-white border border-white/15"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Log New Race Result
              </button>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase">
              <span>Active View:</span>
              <span className="text-[#c5a880] font-bold">{activeTab === "dashboard" ? "Dashboard & Telemetry" : "Race Logger"}</span>
            </div>
          </div>
        )}

        {/* Celebratory Banner Notification (Appears on top after logging a race) */}
        <AnimatePresence>
          {celebratoryMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#c5a880]/15 to-emerald-500/20 border border-[#c5a880]/40 p-5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(197,168,128,0.25)_0%,transparent_60%)] pointer-events-none" />
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-[#c5a880] flex items-center justify-center text-black shadow-lg">
                  <Trophy className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#c5a880] font-bold">
                    Race Session Logged Successfully
                  </div>
                  <div className="text-base md:text-lg font-display font-medium text-white tracking-tight mt-0.5">
                    {celebratoryMessage}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCelebratoryMessage(null)}
                className="relative z-10 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/70 text-zinc-300 font-mono text-[10px] uppercase tracking-wider border border-white/10 transition-colors"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mb-8 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400 text-xs font-mono flex justify-between items-center tracking-wider uppercase">
            <span>{error}</span>
            <button
              onClick={fetchRaces}
              className="flex items-center gap-1 bg-white text-black font-semibold font-display px-3 py-1.5 rounded-lg text-[10px] tracking-wider"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 font-mono text-[10px] tracking-widest uppercase text-zinc-500 gap-4">
            <RefreshCw className="w-6 h-6 text-[#c5a880] animate-spin" />
            <span>Initializing race session telemetry...</span>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" ? (
              <div className="space-y-8">
                {/* Scoreboard block */}
                <section aria-label="Scoreboard Panel">
                  <Scoreboard races={races} />
                </section>

                {/* Cumulative Progress block */}
                <section aria-label="Endurance Tracker Panel">
                  <PersistentProgress races={races} />
                </section>

                {/* Circuit Record Holders */}
                <section aria-label="Track Records Panel">
                  <TrackRecords races={races} />
                </section>

                {/* Race History Logbook */}
                <section aria-label="Race History Panel">
                  <RaceHistory
                    races={races}
                    onDeleteRace={handleDeleteRace}
                    onRefresh={fetchRaces}
                  />
                </section>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="cred-card cred-metal-gold cred-card-glow-gold rounded-2xl p-6 md:p-8 relative overflow-hidden border border-white/10 shadow-2xl">
                  {/* Corner Rivets */}
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

                  <div className="mb-6 pb-4 border-b border-white/[0.08] flex items-center justify-between relative z-10">
                    <div>
                      <div className="text-[10px] font-mono text-[#c5a880] uppercase tracking-[0.2em] font-bold mb-1">
                        SESSION SUBMISSION MODULE
                      </div>
                      <h2 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight">
                        Log New Head-to-Head Race Result
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-[10px] uppercase tracking-wider border border-white/10 transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                  <RaceLogForm onAddRace={handleAddRace} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#141418] border-t border-white/[0.04] py-8 mt-16 text-center font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            &copy; {new Date().getFullYear()} HARISH vs SHABESH. Crafted for ultra-competitive racing.
          </div>
          <div className="flex items-center gap-4 text-[9px]">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-red-500" />
              Formula 1
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-yellow-500" />
              Assetto Corsa
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400" />
              Auto Mobilista 2
            </span>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
