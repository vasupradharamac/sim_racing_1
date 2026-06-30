import React, { useState, useEffect } from "react";
import { RaceResult } from "./types";
import Scoreboard from "./components/Scoreboard";
import RaceLogForm from "./components/RaceLogForm";
import RaceHistory from "./components/RaceHistory";
import TrackRecords from "./components/TrackRecords";
import PersistentProgress from "./components/PersistentProgress";
import { Shield, Flag, Award, RefreshCw, Layers } from "lucide-react";
import { motion } from "motion/react";

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Upper Racing Line Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 via-emerald-500 via-cyan-500 to-blue-600 shadow-[0_2px_15px_rgba(239,68,68,0.4)]" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10 flex-grow">
        {/* Header section with carbon styling */}
        <header className="mb-8 border-b border-zinc-900 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative bg-red-600 text-white p-3 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500">
              <Flag className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black tracking-widest text-red-500 uppercase bg-red-950/50 border border-red-900/40 px-2 py-0.5 rounded">
                  H2H Telemetry V2.0
                </span>
                <span className="text-[10px] font-mono text-zinc-600">
                  EST. 2026
                </span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1 uppercase">
                Sim Racing Head-to-Head
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Database Synchronized:</span>
            <span className="text-zinc-200 font-bold bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
              racing_data.csv
            </span>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-900/60 rounded-xl text-red-400 text-sm font-mono flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={fetchRaces}
              className="flex items-center gap-1 bg-red-900 hover:bg-red-800 text-white px-3 py-1 rounded-lg text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 font-mono text-xs text-zinc-500 gap-3">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
            <span>Initializing race session telemetry...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Data Input */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
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
      <footer className="bg-zinc-950 border-t border-zinc-900 py-6 mt-12 text-center font-mono text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div>
            &copy; {new Date().getFullYear()} HARISH vs SHABESH. Crafted for ultra-competitive racing.
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              Formula 1
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-yellow-500" />
              Assetto Corsa
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Auto Mobilista 2
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
