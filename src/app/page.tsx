"use client";

import React, { useState, useCallback } from "react";
import PetriDish from "@/components/PetriDish";
import StatsPanel from "@/components/StatsPanel";
import ControlDeck from "@/components/ControlDeck";

export default function Home() {
  const [resetSignal, setResetSignal] = useState(0);
  const [stats, setStats] = useState({ susceptible: 0, resistant: 0 });

  // Simulation Parameters
  const [mutationRate, setMutationRate] = useState(0.05);
  const [reproductionChance, setReproductionChance] = useState(0.005);
  const [maxPopulation, setMaxPopulation] = useState(1000);
  const [discRadius, setDiscRadius] = useState(60);
  const [movementSpeed, setMovementSpeed] = useState(1.0);

  const handleReset = () => {
    setResetSignal((prev) => prev + 1);
  };

  const onStatsUpdate = useCallback((susceptible: number, resistant: number) => {
    setStats({ susceptible, resistant });
  }, []);

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--bg-cream)] text-[var(--ink-black)]">

      {/* 1. TOP NAVIGATION BAR */}
      <header className="w-full flex justify-between items-center shrink-0 z-30 px-4 py-3 sm:px-8 sm:py-4 font-mono text-[10px] tracking-tighter uppercase">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-rust)]"></div>
          <span>PROJECT: EVODISH // SEQ-001</span>
        </div>
        <div className="flex gap-4 sm:gap-8">
          <span className="cursor-pointer hover:underline opacity-50 font-bold border-b border-black">LIVE_FEED</span>
          <span className="cursor-pointer hover:underline opacity-50 hidden sm:inline">REPORTS</span>
          <span className="cursor-pointer hover:underline opacity-50 hidden sm:inline">ARCHIVE</span>
        </div>
      </header>

      {/* 2. EVODISH TITLE — prominent, visible */}
      <div className="w-full shrink-0 flex flex-col items-center px-4 pb-1 sm:pb-2">
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-black leading-none uppercase select-none">
          EVODISH
        </h1>
        <div className="flex flex-wrap justify-center gap-2 mt-1 sm:mt-2">
          <div className="pill-label bg-white/70 backdrop-blur-sm shadow-sm border-black/5">ANTIBIOTIC SIMULATION</div>
          <div className="pill-label border-[var(--accent-rust)] text-[var(--accent-rust)] bg-[var(--bg-cream)] uppercase hidden sm:block">Evolutionary Pressure</div>
          <div className="pill-label bg-black text-white uppercase">Status: Active</div>
        </div>
      </div>

      {/* 3. MAIN CONTENT — stats flanking the dish */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0 px-2 sm:px-4 gap-2 sm:gap-4">

        {/* Left Stats */}
        <StatsPanel
          side="left"
          susceptible={stats.susceptible}
          resistant={stats.resistant}
        />

        {/* Petri Dish Canvas — constrained to available space */}
        <div className="relative flex items-center justify-center flex-1 min-w-0 h-full max-h-full overflow-hidden">
          <PetriDish
            resetSignal={resetSignal}
            mutationRate={mutationRate}
            reproductionChance={reproductionChance}
            maxPopulation={maxPopulation}
            discRadius={discRadius}
            movementSpeed={movementSpeed}
            onStatsUpdate={onStatsUpdate}
          />
        </div>

        {/* Right Stats */}
        <StatsPanel
          side="right"
          susceptible={stats.susceptible}
          resistant={stats.resistant}
        />
      </div>

      {/* 4. BOTTOM CONTROL SECTION */}
      <div className="w-full shrink-0 flex flex-col items-center z-30 px-4 py-3 sm:px-8 sm:py-4 border-t border-black/10">
        <ControlDeck
          onReset={handleReset}
          mutationRate={mutationRate}
          setMutationRate={setMutationRate}
          reproductionChance={reproductionChance}
          setReproductionChance={setReproductionChance}
          maxPopulation={maxPopulation}
          setMaxPopulation={setMaxPopulation}
          discRadius={discRadius}
          setDiscRadius={setDiscRadius}
          movementSpeed={movementSpeed}
          setMovementSpeed={setMovementSpeed}
        />
      </div>
    </main>
  );
}
