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

      {/* Control Deck */}
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
    </main>
  );
}
