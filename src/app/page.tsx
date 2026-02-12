"use client";

import React, { useState, useCallback } from "react";
import PetriDish from "@/components/PetriDish";
import StatsPanel from "@/components/StatsPanel";
import ControlDeck from "@/components/ControlDeck";
import PopulationChart from "@/components/PopulationChart";
import { PopulationSnapshot } from "@/types";

export default function Home() {
  const [resetSignal, setResetSignal] = useState(0);
  const [stats, setStats] = useState({ susceptible: 0, resistant: 0 });
  const [populationHistory, setPopulationHistory] = useState<PopulationSnapshot[]>([]);

  // Simulation Parameters
  const [mutationRate, setMutationRate] = useState(0.05);
  const [reproductionChance, setReproductionChance] = useState(0.005);
  const [maxPopulation, setMaxPopulation] = useState(1000);
  const [discRadius, setDiscRadius] = useState(60);
  const [movementSpeed, setMovementSpeed] = useState(1.0);

  // Advanced Mode
  const [advancedMode, setAdvancedMode] = useState(false);
  const [conjugationRate, setConjugationRate] = useState(0.005);
  const [fitnessCostMultiplier, setFitnessCostMultiplier] = useState(1.5);

  const handleReset = () => {
    setResetSignal((prev) => prev + 1);
    setPopulationHistory([]);
  };

  const onStatsUpdate = useCallback((susceptible: number, resistant: number) => {
    setStats({ susceptible, resistant });
    setPopulationHistory(prev => {
      const next = [...prev, { susceptible, resistant }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--bg-cream)] text-[var(--ink-black)]">

      {/* TOP HEADER + TITLE CLUSTER */}
      <header className="w-full shrink-0 z-30 px-4 py-2 sm:px-8 sm:py-3 font-mono text-[10px] tracking-tighter uppercase">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-rust)]"></div>
            <span>LIVE_FEED</span>
          </div>
          <div className="flex gap-4 sm:gap-8">
            <span className="cursor-pointer hover:underline opacity-50 hidden sm:inline">ARCHIVE</span>
          </div>
        </div>
        <div className="mt-1 flex flex-col items-center">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-black leading-none uppercase select-none">
            EVODISH
          </h1>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            <div className="pill-label bg-white/70 backdrop-blur-sm shadow-sm border-black/5">ANTIBIOTIC SIMULATION</div>
            <div className="pill-label border-[var(--accent-rust)] text-[var(--accent-rust)] bg-[var(--bg-cream)] uppercase hidden sm:block">EVOLUTIONARY PRESSURE</div>
            <div className="pill-label bg-black text-white uppercase">STATUS: ACTIVE</div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT — controls left, canvas center, stats right */}
      <div className="flex-1 flex items-stretch w-full min-h-0 px-2 sm:px-4 gap-2 sm:gap-4 pb-2 sm:pb-4">

        {/* Left: Control Deck */}
        <div className="shrink-0 w-36 sm:w-44 md:w-52 overflow-y-auto z-10">
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
            advancedMode={advancedMode}
            setAdvancedMode={setAdvancedMode}
            conjugationRate={conjugationRate}
            setConjugationRate={setConjugationRate}
            fitnessCostMultiplier={fitnessCostMultiplier}
            setFitnessCostMultiplier={setFitnessCostMultiplier}
          />
        </div>

        {/* Center: Petri Dish Canvas */}
        <div className="relative flex items-center justify-center flex-1 min-w-0 h-full max-h-full overflow-hidden">
          <PetriDish
            resetSignal={resetSignal}
            mutationRate={mutationRate}
            reproductionChance={reproductionChance}
            maxPopulation={maxPopulation}
            discRadius={discRadius}
            movementSpeed={movementSpeed}
            onStatsUpdate={onStatsUpdate}
            advancedMode={advancedMode}
            conjugationRate={conjugationRate}
            fitnessCostMultiplier={fitnessCostMultiplier}
          />
        </div>

        {/* Right: Stats Panels stacked */}
        <div className="shrink-0 w-28 sm:w-36 md:w-48 flex flex-col justify-start gap-6 pt-4 sm:pt-6">
          <StatsPanel
            side="left"
            susceptible={stats.susceptible}
            resistant={stats.resistant}
          />
          <StatsPanel
            side="right"
            susceptible={stats.susceptible}
            resistant={stats.resistant}
          />
          {advancedMode && (
            <PopulationChart history={populationHistory} />
          )}
        </div>
      </div>
    </main>
  );
}
