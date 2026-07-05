import React, { useState, useEffect } from "react";

export default function PaganiRpmGauge() {
  const [rpm, setRpm] = useState(1.2); // x1000 RPM
  const [isRevving, setIsRevving] = useState(false);

  // High-frequency throttle simulation (organic idle jitter + periodic rev sweeps)
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let revPhase = 0; // 0 = idle, 1 = rising, 2 = holding/bouncing, 3 = falling
    let revStartTime = 0;
    let revDuration = 800; // ms to reach peak
    let peakRpm = 7.5;
    let startRpm = 1.2;
    let currentRpmValue = 1.2;
    let localIsRevving = false;

    const simulateEngine = (time: number) => {
      // Randomly trigger a rev every 7 to 10 seconds if not already revving
      if (!localIsRevving && Math.random() < 0.002 && time - revStartTime > 6000) {
        localIsRevving = true;
        setIsRevving(true);
        revPhase = 1; // Start rising
        revStartTime = time;
        peakRpm = 6.2 + Math.random() * 2.1; // Rev peak between 6.2 and 8.3
        startRpm = currentRpmValue;
      }

      let targetRpm = currentRpmValue;

      if (revPhase === 1) {
        // Rising throttle
        const elapsed = time - revStartTime;
        const progress = Math.min(elapsed / revDuration, 1);
        // Throttle response curve: ease-in-out or fast exponential rise
        const t = Math.pow(progress, 1.8);
        targetRpm = startRpm + (peakRpm - startRpm) * t;

        if (progress >= 1) {
          revPhase = 2; // Hold / blip slightly
          revStartTime = time;
        }
      } else if (revPhase === 2) {
        // Blip / hold at redline for a split second (150ms)
        const elapsed = time - revStartTime;
        const jitter = (Math.random() - 0.5) * 0.15;
        targetRpm = peakRpm - 0.1 + jitter;

        if (elapsed > 180) {
          revPhase = 3; // Let off throttle
          revStartTime = time;
        }
      } else if (revPhase === 3) {
        // Natural RPM decay (slower than rise, exponential fall)
        const elapsed = time - revStartTime;
        const decayDuration = 1200;
        const progress = Math.min(elapsed / decayDuration, 1);
        const t = Math.pow(progress, 2.2); // steeper decay
        targetRpm = peakRpm - (peakRpm - 1.2) * t;

        if (progress >= 1) {
          revPhase = 0; // Return to idle
          localIsRevving = false;
          setIsRevving(false);
          revStartTime = time;
        }
      } else {
        // Organic idle jitter around 1.15k - 1.25k RPM
        const baseIdle = 1.2;
        const wave = Math.sin(time * 0.05) * 0.04;
        const noise = (Math.random() - 0.5) * 0.02;
        targetRpm = baseIdle + wave + noise;
      }

      currentRpmValue = targetRpm;
      setRpm(targetRpm);

      lastTime = time;
      animationFrameId = requestAnimationFrame(simulateEngine);
    };

    animationFrameId = requestAnimationFrame(simulateEngine);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Pagani layout math
  // Arc spans 270 degrees, centered from 135 deg to 405 deg.
  // 0 RPM = 135 deg, 8 RPM = 405 deg.
  const getAngleForRpm = (val: number) => {
    const minRpm = 0;
    const maxRpm = 8;
    const clamped = Math.max(minRpm, Math.min(maxRpm, val));
    return 135 + clamped * (270 / maxRpm);
  };

  const needleAngle = getAngleForRpm(rpm);

  // Helper arrays for SVG rendering
  const ticks = Array.from({ length: 41 }, (_, i) => i * 0.2); // Ticks every 0.2 RPM
  const majorNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="relative w-14 h-14 flex items-center justify-center select-none" id="pagani-rpm-gauge-container">
      {/* Outer Golden/Chrome Ambient Backlight Halo */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.12)_0%,transparent_70%)] animate-pulse" />

      {/* Exquisite 3D Bezel Frame */}
      <div className="absolute inset-[1px] rounded-full border border-white/10 bg-gradient-to-b from-zinc-700/30 to-zinc-950/90 shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.12),_0_4px_12px_rgba(0,0,0,0.9)]" />

      {/* SVG Engine */}
      <svg
        className="w-full h-full relative z-10"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Dial Face Brushed Texture Simulation */}
          <radialGradient id="machinedFace" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a0a0d" />
            <stop offset="75%" stopColor="#040405" />
            <stop offset="90%" stopColor="#100f13" />
            <stop offset="96%" stopColor="#1e1d24" />
            <stop offset="100%" stopColor="#09080a" />
          </radialGradient>

          {/* Machined Chrome Outer Bezel Ring */}
          <linearGradient id="chromeRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c5a880" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#443a2d" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c5a880" stopOpacity="0.8" />
          </linearGradient>

          {/* Glowing Redline Zone Backlight */}
          <radialGradient id="redlineGlow" cx="75%" cy="75%" r="25%">
            <stop offset="0%" stopColor="#df8f73" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#df8f73" stopOpacity="0" />
          </radialGradient>

          {/* Machined Center Cap Gradients */}
          <linearGradient id="centerCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#c5a880" />
            <stop offset="70%" stopColor="#30281c" />
            <stop offset="100%" stopColor="#12100d" />
          </linearGradient>
        </defs>

        {/* Dial Background */}
        <circle cx="50" cy="50" r="46" fill="url(#machinedFace)" />

        {/* Redline Glow (7,000 - 8,000 RPM area) */}
        {rpm >= 6.8 && (
          <circle cx="50" cy="50" r="44" fill="url(#redlineGlow)" className="transition-opacity duration-150" />
        )}

        {/* Outer Circular Chrome Detailing */}
        <circle cx="50" cy="50" r="46.5" stroke="url(#chromeRing)" strokeWidth="0.85" />
        <circle cx="50" cy="50" r="44.2" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="0.5" />

        {/* Exquisite Bezel Screws/Rivets (Pagani hallmark) */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const rx = 50 + 44.5 * Math.cos(rad);
          const ry = 50 + 44.5 * Math.sin(rad);
          return (
            <g key={`screw-${i}`}>
              <circle cx={rx} cy={ry} r="0.95" fill="#1b1a22" stroke="#c5a880" strokeWidth="0.25" strokeOpacity="0.8" />
              <line x1={rx - 0.5} y1={ry - 0.3} x2={rx + 0.5} y2={ry + 0.3} stroke="#000000" strokeWidth="0.2" />
            </g>
          );
        })}

        {/* Concentric Detailing Rings */}
        <circle cx="50" cy="50" r="33.5" stroke="#c5a880" strokeOpacity="0.12" strokeWidth="0.5" strokeDasharray="1,2" />
        <circle cx="50" cy="50" r="23" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />

        {/* Chrono Style Scale Ticks */}
        {ticks.map((tickVal) => {
          const angle = getAngleForRpm(tickVal);
          const rad = (angle * Math.PI) / 180;
          const isMajor = tickVal % 1 === 0;
          const isRedline = tickVal >= 7.0;

          // Inside a Pagani instrument, ticks are highly detailed metal notches
          const startRad = 42;
          const endRad = isMajor ? 37 : 39.5;

          const x1 = 50 + startRad * Math.cos(rad);
          const y1 = 50 + startRad * Math.sin(rad);
          const x2 = 50 + endRad * Math.cos(rad);
          const y2 = 50 + endRad * Math.sin(rad);

          let strokeColor = isRedline 
            ? "#df8f73" // redline orange
            : isMajor 
              ? "#c5a880" // golden bronze major
              : "rgba(197, 168, 128, 0.4)"; // muted golden bronze minor

          const strokeWidth = isMajor ? 0.75 : 0.4;

          return (
            <line
              key={`tick-${tickVal}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        })}

        {/* Major Dial Numbers (0 to 8 x1000) */}
        {majorNumbers.map((num) => {
          const angle = getAngleForRpm(num);
          const rad = (angle * Math.PI) / 180;
          // Radii offset to center numbers beautifully
          const numRadius = 31.5;
          const tx = 50 + numRadius * Math.cos(rad);
          const ty = 50 + numRadius * Math.sin(rad) + 1.2; // vertical center adjustment

          const isRedline = num >= 7;

          return (
            <text
              key={`num-${num}`}
              x={tx}
              y={ty}
              fill={isRedline ? "#df8f73" : "#e4d3ba"}
              fontSize="4.8"
              fontWeight={isRedline ? "700" : "400"}
              fontFamily="monospace"
              textAnchor="middle"
              className="select-none"
              opacity={isRedline ? 1 : 0.85}
            >
              {num}
            </text>
          );
        })}

        {/* Center engagement labeling (engraved metadata) */}
        <text
          x="50"
          y="68"
          fill="#c5a880"
          fontSize="3.2"
          fontWeight="700"
          fontFamily="monospace"
          letterSpacing="0.1em"
          textAnchor="middle"
          opacity="0.5"
        >
          RPM x1000
        </text>
        <text
          x="50"
          y="74"
          fill="#ffffff"
          fontSize="2.4"
          fontWeight="400"
          fontFamily="monospace"
          letterSpacing="0.15em"
          textAnchor="middle"
          opacity="0.3"
        >
          UTOPIA V12
        </text>

        {/* Dynamic Sweeping Needle (Mechanical master design with fine tail) */}
        <g transform={`rotate(${needleAngle - 270}, 50, 50)`}>
          {/* Subtle drop shadow behind needle */}
          <line
            x1="50"
            y1="54"
            x2="50"
            y2="13"
            stroke="#000"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.45"
            transform="translate(0.8, 0.8)"
          />

          {/* Precision Horological Needle (Classic Pagani orange-crimson pointer) */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="12.5"
            stroke="#df8f73" // dynamic crimson orange core
            strokeWidth="0.85"
            strokeLinecap="round"
          />

          {/* Needle Highlight Spine (Thin silver reflection) */}
          <line
            x1="50"
            y1="40"
            x2="50"
            y2="13"
            stroke="#ffffff"
            strokeWidth="0.3"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Elegant tear-shaped counterweight extension on opposite side */}
          <path
            d="M 48.8,50 C 48.8,54 49.3,58 50,58 C 50.7,58 51.2,54 51.2,50 Z"
            fill="#c5a880"
            opacity="0.9"
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="58"
            stroke="#26211a"
            strokeWidth="0.4"
          />
        </g>

        {/* Master Center Bezel Pivot Cap (machined concentric metal studs) */}
        <circle cx="50" cy="50" r="5.8" fill="url(#centerCap)" stroke="#1a1510" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="3.2" fill="#1b1a22" stroke="#c5a880" strokeWidth="0.2" strokeOpacity="0.4" />
        <circle cx="50" cy="50" r="1.1" fill="#ffffff" opacity="0.9" />
      </svg>

      {/* Extreme Fine Metallic Reflection Overlay Shine */}
      <div className="absolute inset-0 rounded-full pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] mix-blend-overlay" />
    </div>
  );
}
