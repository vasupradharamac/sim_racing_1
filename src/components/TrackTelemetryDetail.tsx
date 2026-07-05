import React, { useState } from "react";
import { RaceResult } from "../types";
import { parseTimeToSeconds, formatSecondsToTime, getTrackLengthKM } from "../utils";
import { X, Calendar, User, Info, Trophy, Milestone, CloudSun, Timer, TrendingDown, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TrackTelemetryDetailProps {
  trackName: string;
  gameName: string;
  races: RaceResult[];
  onClose: () => void;
}

export default function TrackTelemetryDetail({ trackName, gameName, races, onClose }: TrackTelemetryDetailProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Filter and sort all races on this track chronologically
  const trackRaces = races
    .filter((r) => r.track === trackName && r.game === gameName)
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
    });

  // Personal best calculation
  const harishRaces = trackRaces.filter((r) => r.fastestLap === "Harish");
  const shabeshRaces = trackRaces.filter((r) => r.fastestLap === "Shabesh");

  const getPB = (driverRaces: RaceResult[]) => {
    if (driverRaces.length === 0) return null;
    return driverRaces.reduce((best, cur) => {
      const bestSec = parseTimeToSeconds(best.fastestLapTime);
      const curSec = parseTimeToSeconds(cur.fastestLapTime);
      return curSec < bestSec ? cur : best;
    });
  };

  const harishPB = getPB(harishRaces);
  const shabeshPB = getPB(shabeshRaces);

  const harishSec = harishPB ? parseTimeToSeconds(harishPB.fastestLapTime) : null;
  const shabeshSec = shabeshPB ? parseTimeToSeconds(shabeshPB.fastestLapTime) : null;

  // Track Length
  const lengthKM = getTrackLengthKM(trackName);

  // Calculate Delta
  let deltaStr = "";
  let deltaHolder: "Harish" | "Shabesh" | null = null;
  if (harishSec !== null && shabeshSec !== null) {
    const diff = Math.abs(harishSec - shabeshSec);
    deltaStr = `-${diff.toFixed(3)}s`;
    deltaHolder = harishSec < shabeshSec ? "Harish" : "Shabesh";
  }

  // Graph Dimensions
  const width = 500;
  const height = 220;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  // Graph Plotting Math
  const timesInSeconds = trackRaces
    .map((r) => parseTimeToSeconds(r.fastestLapTime))
    .filter((val) => val > 0 && !isNaN(val));
  const minSec = timesInSeconds.length > 0 ? Math.min(...timesInSeconds) : 0;
  const maxSec = timesInSeconds.length > 0 ? Math.max(...timesInSeconds) : 0;

  const span = maxSec - minSec;
  const yMin = minSec - (span > 0 ? span * 0.2 : 2);
  const yMax = maxSec + (span > 0 ? span * 0.2 : 2);

  const getX = (index: number) => {
    if (trackRaces.length <= 1) return (width - paddingLeft - paddingRight) / 2 + paddingLeft;
    return paddingLeft + (index / (trackRaces.length - 1)) * (width - paddingLeft - paddingRight);
  };

  const getY = (val: number) => {
    if (yMax === yMin || isNaN(yMax) || isNaN(yMin)) return (height - paddingTop - paddingBottom) / 2 + paddingTop;
    return height - paddingBottom - ((val - yMin) / (yMax - yMin)) * (height - paddingTop - paddingBottom);
  };

  // Build line paths for each driver
  const harishPoints = trackRaces
    .map((r, idx) => ({ r, idx }))
    .filter((p) => p.r.fastestLap === "Harish");

  const shabeshPoints = trackRaces
    .map((r, idx) => ({ r, idx }))
    .filter((p) => p.r.fastestLap === "Shabesh");

  const getPathD = (points: { r: RaceResult; idx: number }[]) => {
    const validPoints = points.filter(p => {
      const sec = parseTimeToSeconds(p.r.fastestLapTime);
      return sec > 0 && !isNaN(sec);
    });
    if (validPoints.length < 2) return "";
    return validPoints.reduce((path, p, i) => {
      const x = getX(p.idx);
      const y = getY(parseTimeToSeconds(p.r.fastestLapTime));
      return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, "");
  };

  const harishPath = getPathD(harishPoints);
  const shabeshPath = getPathD(shabeshPoints);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto" id="track-telemetry-modal">
      {/* Background glass card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl my-4 md:my-8 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-6 shadow-2xl md:p-8 overflow-hidden"
      >
        {/* Screw rivets decoration */}
        <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
          <div className="w-[1px] h-full bg-zinc-950/80 rotate-45" />
        </div>
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
          <div className="w-[1px] h-full bg-zinc-950/80 -rotate-45" />
        </div>
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
          <div className="w-[1px] h-full bg-zinc-950/80 -rotate-12" />
        </div>
        <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
          <div className="w-[1px] h-full bg-zinc-950/80 rotate-12" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full border border-white/5 cursor-pointer transition-colors"
          title="Close Detail Panel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <Trophy className="w-4 h-4 text-[#c5a880] animate-pulse" />
            <span className="text-[10px] md:text-xs font-mono font-black text-[#c5a880] uppercase tracking-[0.25em]">
              {gameName} • CIRCUIT TELEMETRY ARCHIVE
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-light text-white tracking-tight">
            {trackName}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs md:text-sm text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <Milestone className="w-4 h-4 text-zinc-500" /> Length: <strong className="text-zinc-200">{lengthKM.toFixed(3)} KM</strong>
            </span>
            <span className="text-zinc-700">•</span>
            <span>Sessions Run: <strong className="text-zinc-200">{trackRaces.length}</strong></span>
          </div>
        </div>

        {/* Head-to-Head Statistics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Harish Personal Best */}
          <div className="bg-[#120b08]/50 border border-[#df8f73]/15 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#df8f73]/30" />
            <div>
              <span className="text-[10px] font-mono text-[#df8f73]/80 uppercase tracking-widest block mb-0.5">
                SOLOARMADA PB
              </span>
              <span className="text-2xl md:text-3xl font-mono font-light text-white leading-none">
                {harishPB ? harishPB.fastestLapTime : "N/A"}
              </span>
            </div>
            {harishPB && (
              <span className="text-[10px] text-zinc-500 font-mono mt-2 uppercase tracking-wide truncate">
                {harishPB.carClass} • {harishPB.date}
              </span>
            )}
          </div>

          {/* Shabesh Personal Best */}
          <div className="bg-[#0a0b0d]/50 border border-[#94a9b8]/15 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#94a9b8]/30" />
            <div>
              <span className="text-[10px] font-mono text-[#94a9b8]/80 uppercase tracking-widest block mb-0.5">
                VIATICMONK PB
              </span>
              <span className="text-2xl md:text-3xl font-mono font-light text-white leading-none">
                {shabeshPB ? shabeshPB.fastestLapTime : "N/A"}
              </span>
            </div>
            {shabeshPB && (
              <span className="text-[10px] text-zinc-500 font-mono mt-2 uppercase tracking-wide truncate">
                {shabeshPB.carClass} • {shabeshPB.date}
              </span>
            )}
          </div>

          {/* Track Delta */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">
                TELEMETRY DELTA
              </span>
              {deltaStr ? (
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-mono font-bold text-emerald-400 leading-none">
                    {deltaStr}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mt-1.5">
                    FASTER: <strong className={deltaHolder === "Harish" ? "text-[#df8f73]" : "text-[#94a9b8]"}>
                      {deltaHolder === "Harish" ? "HARISH" : "SHABESH"}
                    </strong>
                  </span>
                </div>
              ) : (
                <div className="py-2">
                  <span className="text-sm font-mono text-zinc-600 uppercase tracking-widest block leading-none">
                    No Direct Comparison
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono uppercase mt-1 block">
                    Need data for both drivers
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The Graphic Progression Panel */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-6 relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              Chronological Performance Evolution
            </span>
            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] md:text-xs font-mono font-bold">
              <span className="flex items-center gap-1 text-[#df8f73]">
                <span className="w-2 h-2 rounded-full bg-[#df8f73]" /> HARISH
              </span>
              <span className="flex items-center gap-1 text-[#94a9b8]">
                <span className="w-2 h-2 rounded-full bg-[#94a9b8]" /> SHABESH
              </span>
            </div>
          </div>

          {trackRaces.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
                No telemetry telemetry registered for this circuit.
              </span>
            </div>
          ) : (
            <div className="relative">
              {/* Responsive SVG Chart */}
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                  const val = yMin + p * (yMax - yMin);
                  const y = getY(val);
                  return (
                    <g key={`grid-${idx}`}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={width - paddingRight}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.03)"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        fill="#52525b"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {formatSecondsToTime(val).replace("s", "")}
                      </text>
                    </g>
                  );
                })}

                {/* Y-axis label */}
                <text
                  transform={`rotate(-90, 15, ${height / 2})`}
                  x="15"
                  y={height / 2}
                  fill="#71717a"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                  letterSpacing="0.1em"
                  className="uppercase"
                >
                  Lap Time (Seconds)
                </text>

                {/* Draw connecting lines for Harish (if > 1 point) */}
                {harishPath && (
                  <path
                    d={harishPath}
                    fill="none"
                    stroke="#df8f73"
                    strokeWidth="1.5"
                    strokeOpacity="0.75"
                    className="drop-shadow-[0_0_4px_rgba(223,143,115,0.4)]"
                  />
                )}

                {/* Draw connecting lines for Shabesh (if > 1 point) */}
                {shabeshPath && (
                  <path
                    d={shabeshPath}
                    fill="none"
                    stroke="#94a9b8"
                    strokeWidth="1.5"
                    strokeOpacity="0.75"
                    className="drop-shadow-[0_0_4px_rgba(148,169,184,0.4)]"
                  />
                )}

                {/* Draw session dots */}
                {trackRaces.map((race, idx) => {
                  const x = getX(idx);
                  const y = getY(parseTimeToSeconds(race.fastestLapTime));
                  const isHarish = race.fastestLap === "Harish";
                  const color = isHarish ? "#df8f73" : "#94a9b8";
                  const isHovered = hoveredPoint === idx;

                  return (
                    <g key={`dot-${idx}`} className="cursor-pointer">
                      {/* Active/glowing outer circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 3.5}
                        fill={color}
                        fillOpacity={isHovered ? 0.3 : 0.15}
                        stroke={color}
                        strokeWidth={isHovered ? 2 : 1}
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="transition-all duration-150"
                      />
                      {/* Innermost dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r="1.5"
                        fill="#ffffff"
                        pointerEvents="none"
                      />
                    </g>
                  );
                })}

                {/* X-axis dates/sessions label */}
                {trackRaces.map((race, idx) => {
                  // Only show label for some points to prevent overlapping on mobile
                  const showLabel = 
                    trackRaces.length <= 6 || 
                    idx === 0 || 
                    idx === trackRaces.length - 1 || 
                    (trackRaces.length > 6 && idx === Math.floor(trackRaces.length / 2));

                  if (!showLabel) return null;

                  const x = getX(idx);
                  const dateParts = race.date.split("-");
                  // Format as MM/DD
                  const shortDate = dateParts.length >= 3 ? `${dateParts[1]}/${dateParts[2]}` : race.date;

                  return (
                    <text
                      key={`lbl-${idx}`}
                      x={x}
                      y={height - paddingBottom + 16}
                      fill="#52525b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {shortDate}
                    </text>
                  );
                })}
              </svg>

              {/* Tooltip Card Overlay (renders inside absolute container) */}
              <AnimatePresence>
                {hoveredPoint !== null && trackRaces[hoveredPoint] && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 pointer-events-none bg-[#0a0a0f] border border-white/10 rounded-lg p-3 shadow-xl max-w-[200px]"
                    style={{
                      left: `${Math.min(
                        Math.max(10, (getX(hoveredPoint) / width) * 100 - 15),
                        75
                      )}%`,
                      bottom: "55px"
                    }}
                  >
                    <div className="flex justify-between items-center mb-1 border-b border-white/5 pb-1">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">
                        Sess #{hoveredPoint + 1}
                      </span>
                      <span className={`text-[10px] font-mono font-black uppercase ${
                        trackRaces[hoveredPoint].fastestLap === "Harish" ? "text-[#df8f73]" : "text-[#94a9b8]"
                      }`}>
                        {trackRaces[hoveredPoint].fastestLap === "Harish" ? "Harish" : "Shabesh"}
                      </span>
                    </div>
                    <div className="font-mono text-white text-xs font-bold">
                      {trackRaces[hoveredPoint].fastestLapTime}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-sans truncate mt-1">
                      🚗 {trackRaces[hoveredPoint].carClass}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-sans mt-0.5">
                      ⛅ {trackRaces[hoveredPoint].conditions}
                    </div>
                    {trackRaces[hoveredPoint].laps && (
                      <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                        🔄 {trackRaces[hoveredPoint].laps} Laps Run
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Detailed Session List Table */}
        <div>
          <h3 className="text-xs md:text-sm font-mono text-zinc-400 uppercase tracking-widest mb-3 font-semibold">
            Chronological Session History
          </h3>
          <div className="overflow-x-auto overflow-y-auto rounded-lg border border-white/5 bg-zinc-950/40 max-h-[160px]">
            <table className="w-full text-left border-collapse text-xs md:text-sm font-sans">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-500 font-mono text-[9px] md:text-[10px] tracking-wider uppercase">
                  <th className="py-2.5 px-4 font-black">DATE</th>
                  <th className="py-2.5 px-4 font-black">DRIVER</th>
                  <th className="py-2.5 px-4 font-black">LAPTIME</th>
                  <th className="py-2.5 px-4 font-black">CAR / WEATHER</th>
                  <th className="py-2.5 px-4 font-black text-right">LAPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-[11px] md:text-xs">
                {trackRaces.map((race, idx) => (
                  <tr key={race.id} className="hover:bg-white/[0.01] transition-colors font-mono">
                    <td className="py-2 px-4 text-zinc-500">{race.date}</td>
                    <td className={`py-2 px-4 font-bold ${
                      race.fastestLap === "Harish" ? "text-[#df8f73]" : "text-[#94a9b8]"
                    }`}>
                      {race.fastestLap === "Harish" ? "Harish (SoloArmada)" : "ViaticMonk"}
                    </td>
                    <td className="py-2 px-4 text-white font-bold">{race.fastestLapTime}</td>
                    <td className="py-2 px-4 text-zinc-400 truncate max-w-[150px]" title={`${race.carClass} • ${race.conditions}`}>
                      {race.carClass} <span className="text-zinc-600">({race.conditions})</span>
                    </td>
                    <td className="py-2 px-4 text-right text-zinc-500 font-bold">{race.laps || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
