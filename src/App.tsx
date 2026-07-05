import React, { useState, useEffect } from "react";
import { RaceResult } from "./types";
import Scoreboard from "./components/Scoreboard";
import RaceLogForm from "./components/RaceLogForm";
import RaceHistory from "./components/RaceHistory";
import TrackRecords from "./components/TrackRecords";
import PersistentProgress from "./components/PersistentProgress";
import PaganiRpmGauge from "./components/PaganiRpmGauge";
import { Shield, Gauge, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import carBg from "./assets/images/gtr_bg_artsy_1783078522650.jpg";

export default function App() {
  const [races, setRaces] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch("/api/races", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRace),
      });

      if (!res.ok) {
        throw new Error("Failed to save race result");
      }

      const updatedRaces = await res.json();
      setRaces(updatedRaces);
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
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Upper Subtle Golden Thin Accenting Bar */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#c5a880]/30 to-transparent relative z-10" />

      {/* Seamlessly Integrated Artsy Automotive Background */}
      <div className="fixed inset-y-0 left-0 w-full md:w-[60vw] max-w-[850px] pointer-events-none z-0 overflow-hidden select-none">
        {/* Ambient background image */}
        <motion.img
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.45, scale: 1.01 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          src={carBg}
          alt="Sim Racing Telemetry Ambient Art"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        {/* Multi-layered custom gradient masks for extreme seamlessness */}
        {/* Left edge deep fade */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent" />
        {/* Right edge absolute fade to pitch black */}
        <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-black via-black/80 to-transparent" />
        {/* Bottom edge absolute fade to pitch black */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/75 to-transparent" />
        {/* Top edge absolute fade to pitch black */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black via-black/45 to-transparent" />
        {/* Global ambient radial blur/blend - softer dark vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,transparent_20%,rgba(0,0,0,0.35)_50%,#000000_100%)]" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex-grow relative z-10">
        {/* Header section with ultra-luxurious, minimalist styling */}
        <header className="mb-12 border-b border-white/[0.02] pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <PaganiRpmGauge />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-[0.2em]">
                  TELEMETRY READOUT
                </span>
                <span className="text-[8px] font-mono text-zinc-600">
                  EST. 2026
                </span>
              </div>
              <h1 className="text-3xl font-display font-light text-white tracking-tight mt-1.5">
                PERFORMANCE DIALS <span className="font-sans font-extrabold text-2xl text-[#c5a880] tracking-normal block sm:inline sm:ml-2">H2H TELEMETRY</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>DB SYNCHRONIZED:</span>
            <span className="text-zinc-300 font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 font-mono">
              racing_data.csv
            </span>
          </div>
        </header>

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Data Input */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
              <RaceLogForm onAddRace={handleAddRace} />
            </div>

            {/* Main Screen Dashboard panels */}
            <div className="lg:col-span-8 space-y-8">
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
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-white/[0.02] py-8 mt-16 text-center font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
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
  );
}
