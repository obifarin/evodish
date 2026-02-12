"use client";

import React, { useState, useCallback } from "react";
import PetriDish from "@/components/PetriDish";
import StatsPanel from "@/components/StatsPanel";

export default function Home() {
  const [resetSignal, setResetSignal] = useState(0);
  const [stats, setStats] = useState({ susceptible: 0, resistant: 0 });

  const handleReset = () => {
    setResetSignal((prev) => prev + 1);
  };

  const onStatsUpdate = useCallback((susceptible: number, resistant: number) => {
    setStats({ susceptible, resistant });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex justify-between items-start z-10 font-mono text-sm">
        <div>
          <h1 className="text-xl font-bold tracking-widest">PROJECT: EVODISH // SEQ-001</h1>
          <p className="opacity-60">ANTIBIOTIC RESISTANCE SIMULATION</p>
        </div>
        <div className="text-right">
          <p>T-MINUS: <span className="font-bold">00:00:00</span></p>
          <p className="text-[var(--alert-red)] font-bold animate-pulse">LIVE FEED</p>
        </div>
      </div>

      <StatsPanel susceptible={stats.susceptible} resistant={stats.resistant} />

      {/* Main Canvas Container */}
      <div className="relative flex-grow flex items-center justify-center">
        <PetriDish resetSignal={resetSignal} onStatsUpdate={onStatsUpdate} />
      </div>

      {/* Control Deck Placeholder */}
      <div className="z-10 w-full max-w-2xl bg-white/50 backdrop-blur-md border-2 border-[var(--ink-primary)] rounded-[var(--radius-lg)] p-4 flex justify-between items-center shadow-lg">
        <button 
          onClick={handleReset}
          className="font-mono text-sm underline hover:text-[var(--sterile-blue)]"
        >
          RESET SAMPLE
        </button>
        <div className="font-mono text-xs opacity-50">
          CONTROLS_V1.0 INITIALIZING...
        </div>
      </div>
    </main>
  );
}