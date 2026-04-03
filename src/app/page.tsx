"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import PetriDish from "@/components/PetriDish";
import StatsPanel from "@/components/StatsPanel";
import ControlDeck from "@/components/ControlDeck";
import PopulationChart from "@/components/PopulationChart";
import { PopulationSnapshot } from "@/types";

export default function Home() {
  const [resetSignal, setResetSignal] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({ susceptible: 0, resistant: 0 });
  const [populationHistory, setPopulationHistory] = useState<PopulationSnapshot[]>([]);
  const [simFrame, setSimFrame] = useState(0);
  const [hgtCount, setHgtCount] = useState(0);

  // Simulation Parameters
  const [mutationRate, setMutationRate] = useState(0.005);
  const [reproductionChance, setReproductionChance] = useState(0.01);
  const [maxPopulation, setMaxPopulation] = useState(2000);
  const [maxAge, setMaxAge] = useState(800);
  const [discRadius, setDiscRadius] = useState(60);
  const [movementSpeed, setMovementSpeed] = useState(1.0);

  // Advanced Mode
  const [advancedMode, setAdvancedMode] = useState(false);
  const [conjugationRate, setConjugationRate] = useState(0.002);
  const [fitnessCostMultiplier, setFitnessCostMultiplier] = useState(1.5);

  // Experiment Mode (Auto-Pause)
  const [isExperimentMode, setIsExperimentMode] = useState(false);
  const [stopFrame, setStopFrame] = useState(4000);

  const handleReset = () => {
    setResetSignal((prev) => prev + 1);
    setPopulationHistory([]);
    setSimFrame(0);
    setHgtCount(0);
  };

  const onStatsUpdate = useCallback((susceptible: number, resistant: number) => {
    setStats({ susceptible, resistant });
    setPopulationHistory(prev => {
      const next = [...prev, { susceptible, resistant }];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  const onFrameUpdate = useCallback((frame: number) => {
    setSimFrame(frame);
    if (isExperimentMode && frame >= stopFrame) {
      setPaused(true);
    }
  }, [isExperimentMode, stopFrame]);

  const onHgtUpdate = useCallback((count: number) => {
    setHgtCount(count);
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
          </div>
        </div>
      </header>

      {/* MAIN CONTENT — controls left, canvas center, stats right */}
      <div className="flex-1 flex items-stretch w-full min-h-0 px-2 sm:px-4 gap-2 sm:gap-4 pb-2 sm:pb-4">

        {/* Left: Control Deck */}
        <div className="shrink-0 w-36 sm:w-44 md:w-52 overflow-y-auto z-10">
          <ControlDeck
            mutationRate={mutationRate}
            setMutationRate={setMutationRate}
            reproductionChance={reproductionChance}
            setReproductionChance={setReproductionChance}
            maxPopulation={maxPopulation}
            setMaxPopulation={setMaxPopulation}
            maxAge={maxAge}
            setMaxAge={setMaxAge}
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
            isExperimentMode={isExperimentMode}
            setIsExperimentMode={setIsExperimentMode}
            stopFrame={stopFrame}
            setStopFrame={setStopFrame}
          />
        </div>

        {/* Center: Petri Dish Canvas */}
        <div className="relative flex flex-col items-center justify-center flex-1 min-w-0 h-full max-h-full overflow-hidden">
          <PetriDish
            resetSignal={resetSignal}
            paused={paused}
            mutationRate={mutationRate}
            reproductionChance={reproductionChance}
            maxPopulation={maxPopulation}
            maxAge={maxAge}
            discRadius={discRadius}
            movementSpeed={movementSpeed}
            onStatsUpdate={onStatsUpdate}
            onFrameUpdate={onFrameUpdate}
            onHgtUpdate={onHgtUpdate}
            advancedMode={advancedMode}
            conjugationRate={conjugationRate}
            fitnessCostMultiplier={fitnessCostMultiplier}
          />

          {/* Controls row: instruction + tip + play/pause + reset */}
          <div className="flex items-center gap-3 mt-1 font-mono text-[10px] uppercase tracking-wider">
            <p className="opacity-50 animate-pulse">Click the dish to place antibiotic</p>
            <span className="relative group cursor-help">
              <span className="font-bold opacity-60 border-b border-dashed border-black/40">Tip</span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-1.5 bg-black text-white text-[9px] rounded normal-case tracking-normal whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Place multiple discs to observe evolutionary pressure
              </span>
            </span>
            <span className="opacity-20">|</span>
            <button
              onClick={() => setPaused(!paused)}
              className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
              title={paused ? "Resume" : "Pause"}
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 opacity-60 hover:opacity-100 hover:text-[var(--accent-rust)] transition-all"
              title="Reset"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Right: Stats Panels stacked */}
        <div className="shrink-0 w-28 sm:w-36 md:w-48 flex flex-col justify-start gap-6 pt-4 sm:pt-6">
          <StatsPanel
            side="left"
            susceptible={stats.susceptible}
            resistant={stats.resistant}
            simFrame={simFrame}
            hgtCount={hgtCount}
            isExperimentMode={isExperimentMode}
            stopFrame={stopFrame}
          />
          <StatsPanel
            side="right"
            susceptible={stats.susceptible}
            resistant={stats.resistant}
            simFrame={simFrame}
            hgtCount={hgtCount}
            isExperimentMode={isExperimentMode}
            stopFrame={stopFrame}
          />
          <PopulationChart history={populationHistory} />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full shrink-0 text-center py-2 font-mono text-[10px] uppercase tracking-wider text-black">
        Made by{" "}
        <a
          href="https://bifarin.me"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold hover:text-[var(--accent-rust)] transition-colors"
        >
          Olatomiwa Bifarin
        </a>
      </footer>
    </main>
  );
}
