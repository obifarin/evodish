"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, RotateCcw } from "lucide-react";
import PetriDish from "@/components/PetriDish";
import ControlDeck from "@/components/ControlDeck";
import PopulationChart from "@/components/PopulationChart";
import MethodsPanel from "@/components/MethodsPanel";
import DishGuide from "@/components/DishGuide";
import { PopulationSnapshot, SimulationParameters } from "@/types";

export default function Home() {
  const [resetSignal, setResetSignal] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMethodsOpen, setIsMethodsOpen] = useState(false);
  const [stats, setStats] = useState({ susceptible: 0, resistant: 0 });
  const [populationHistory, setPopulationHistory] = useState<PopulationSnapshot[]>([]);
  const [simFrame, setSimFrame] = useState(0);
  const [lastTransferFrame, setLastTransferFrame] = useState<number | null>(null);

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
    setLastTransferFrame(null);
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
      return true;
    }
    return false;
  }, [isExperimentMode, stopFrame]);

  const onHgtUpdate = useCallback((count: number, frame: number) => {
    setLastTransferFrame(count > 0 ? frame : null);
  }, []);

  const simulationParameters: SimulationParameters = {
    mutationRate,
    reproductionChance,
    maxPopulation,
    maxAge,
    discRadius,
    movementSpeed,
    advancedMode,
    conjugationRate,
    fitnessCostMultiplier,
    isExperimentMode,
    stopFrame,
  };

  const populationSummary = (
    <div className="culture-summary" aria-label="Population summary">
      <div><span>Susceptible</span><strong>{stats.susceptible.toLocaleString()}</strong></div>
      <div><span>Resistant</span><strong>{stats.resistant.toLocaleString()}</strong></div>
    </div>
  );
  const transferReadout = (
    <div className={`event-readout ${advancedMode && lastTransferFrame !== null ? "has-transfer" : ""}`}>
      <span className="event-label">{!advancedMode ? "BASIC MODE" : lastTransferFrame === null ? "WATCH FOR VIOLET" : "LAST TRANSFER"}</span>
      <p>{!advancedMode ? "Gene transfer is off. Choose Advanced to enable it." : lastTransferFrame === null
        ? "Waiting for a resistant cell to pass resistance to a neighbor."
        : <>Resistance transferred <span>at frame {lastTransferFrame.toLocaleString()}.</span></>}</p>
    </div>
  );

  return (
    <main className="lab-app flex min-h-screen flex-col bg-[var(--bg-cream)] text-[var(--ink-black)]">

      {/* TOP HEADER + TITLE CLUSTER */}
      <header className="lab-header">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-rust)]"></div>
            <span>{paused ? "CULTURE PAUSED" : "LIVE CULTURE"}</span>
          </div>
          <div className="flex gap-4 sm:gap-8">
            <a
              href="https://www.youtube.com/watch?v=k-bB78I8-_s"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 cursor-pointer opacity-60 transition-opacity hover:opacity-100 hover:underline"
            >
              <Play size={10} className="fill-current" />
              VIDEO_GUIDE
            </a>
            <button
              type="button"
              onClick={() => setIsMethodsOpen(true)}
              className="cursor-pointer opacity-60 transition-opacity hover:opacity-100 hover:underline"
            >
              METHODS
            </button>
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
      <div className="lab-workspace">

        {/* Left: Control Deck */}
        <div className="lab-controls">
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
        <div className="lab-specimen">
          <div className="specimen-heading">
            <div><span className="eyebrow">01 / THE EXPERIMENT</span><h2>Evolution, observed.</h2></div>
            <div className="mode-selector" role="group" aria-label="Simulation mode">
              <button aria-pressed={!advancedMode} onClick={() => setAdvancedMode(false)}>Basic</button>
              <button aria-pressed={advancedMode} onClick={() => setAdvancedMode(true)}>Advanced</button>
            </div>
          </div>
          <div className="specimen-stage">
          <div className="specimen-caption"><span>TOP VIEW · AGAR PLATE</span><span>{paused ? "PAUSED" : "RUNNING"}</span></div>
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

          <div className="dish-legend" aria-label="Cell appearance legend">
            <span><i className="cell-key" /> Susceptible</span>
            <span><i className="cell-key resistant" /> Resistant</span>
            <span className={advancedMode ? "transfer-enabled" : "transfer-disabled"}><i className="transfer-key" /> Transfer {advancedMode ? "on" : "off"}</span>
          </div>
          <div className="dish-toolbar">
            <p id="dish-help">Click or tap to place antibiotic.<br /><span>Keyboard: arrows to aim, Enter to place.</span></p>
            <button onClick={() => setPaused(!paused)} aria-label={paused ? "Resume" : "Pause"}>
              {paused ? <Play size={16} /> : <Pause size={16} />}
              <span>{paused ? "Resume" : "Pause"}</span>
            </button>
            <button onClick={handleReset} aria-label="Reset" title="Reset culture"><RotateCcw size={16} /></button>
          </div>
          </div>
          <div className="specimen-readouts">
            {populationSummary}
            {transferReadout}
          </div>
        </div>

        {/* Right: Stats Panels stacked */}
        <aside className="lab-stats" aria-label="Experiment observations">
          <span className="eyebrow">03 / OBSERVATIONS</span>
          <h2 className="panel-title">The population</h2>
          <div className="desktop-readouts">{populationSummary}</div>
          <PopulationChart history={populationHistory} />
          <dl className="run-details">
            <div><dt>Resistance</dt><dd>{stats.susceptible + stats.resistant > 0 ? (stats.resistant / (stats.susceptible + stats.resistant) * 100).toFixed(1) : "0.0"}%</dd></div>
            <div><dt>Frame</dt><dd>{simFrame.toLocaleString()}</dd></div>
            <div><dt>Capacity</dt><dd>{maxPopulation.toLocaleString()}</dd></div>
            <div><dt>Status</dt><dd>{isExperimentMode && simFrame >= stopFrame ? "Complete" : paused ? "Paused" : "Running"}</dd></div>
          </dl>
          <div className="desktop-readouts">{transferReadout}</div>
          <DishGuide advancedMode={advancedMode} />
        </aside>
      </div>

      {/* Footer */}
      <footer className="w-full shrink-0 text-center px-3 py-2 font-mono text-[10px] font-bold text-black">
        Brought to you by{" "}
        <a href="https://www.titerly.com/" target="_blank" rel="noopener noreferrer"
          className="attribution-link underline hover:text-[var(--accent-rust)]">
          <Image src="/attribution/titerly.png" alt="" width={14} height={14} />Titerly
        </a>
        {" · Created by "}
        <a
          href="https://www.bifarin.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="attribution-link underline hover:text-[var(--accent-rust)] transition-colors"
        >
          <Image src="/attribution/olatomiwa-bifarin.jpg" alt="" width={14} height={14} />
          Olatomiwa Bifarin
        </a>.
      </footer>

      <MethodsPanel
        isOpen={isMethodsOpen}
        onClose={() => setIsMethodsOpen(false)}
        parameters={simulationParameters}
      />
    </main>
  );
}
