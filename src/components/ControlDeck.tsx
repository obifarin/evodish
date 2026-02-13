import React, { useState } from "react";
import { Info } from "lucide-react";

interface ControlDeckProps {
  mutationRate: number;
  setMutationRate: (rate: number) => void;
  reproductionChance: number;
  setReproductionChance: (rate: number) => void;
  maxPopulation: number;
  setMaxPopulation: (count: number) => void;
  discRadius: number;
  setDiscRadius: (radius: number) => void;
  movementSpeed: number;
  setMovementSpeed: (speed: number) => void;
  advancedMode: boolean;
  setAdvancedMode: (mode: boolean) => void;
  conjugationRate: number;
  setConjugationRate: (rate: number) => void;
  fitnessCostMultiplier: number;
  setFitnessCostMultiplier: (mult: number) => void;
}

interface ControlConfig {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: (v: number) => string;
  desc: string;
}

const ControlDeck: React.FC<ControlDeckProps> = ({
  mutationRate,
  setMutationRate,
  reproductionChance,
  setReproductionChance,
  maxPopulation,
  setMaxPopulation,
  discRadius,
  setDiscRadius,
  movementSpeed,
  setMovementSpeed,
  advancedMode,
  setAdvancedMode,
  conjugationRate,
  setConjugationRate,
  fitnessCostMultiplier,
  setFitnessCostMultiplier,
}) => {
  const [description, setDescription] = useState<string>("INITIALIZED");

  const controls: ControlConfig[] = [
    {
      label: "MUTATION",
      value: mutationRate,
      setValue: setMutationRate,
      min: 0,
      max: 0.2,
      step: 0.01,
      display: (v: number) => `${(v * 100).toFixed(0)}%`,
      desc: "GENOME STABILITY: Probability of a bacterium developing resistance during division."
    },
    {
      label: "GROWTH RATE",
      value: reproductionChance,
      setValue: setReproductionChance,
      min: 0,
      max: 0.05,
      step: 0.001,
      display: (v: number) => `${(v * 100).toFixed(1)}%`,
      desc: "How quickly the population divides and grows."
    },
    {
      label: "CAPACITY",
      value: maxPopulation,
      setValue: setMaxPopulation,
      min: 100,
      max: 3000,
      step: 50,
      display: (v: number) => `${v}`,
      desc: "Maximum number of cells the dish can hold."
    },
    {
      label: "DRUG STR.",
      value: discRadius,
      setValue: setDiscRadius,
      min: 20,
      max: 100,
      step: 5,
      display: (v: number) => `${v}PX`,
      desc: "Radius of the antibiotic kill area around a disc."
    },
    {
      label: "MOTION",
      value: movementSpeed,
      setValue: setMovementSpeed,
      min: 0.1,
      max: 4.0,
      step: 0.1,
      display: (v: number) => `${v.toFixed(1)}X`,
      desc: "Speed of bacterial movement and mixing."
    },
  ];

  const advancedControls: ControlConfig[] = [
    {
      label: "CONJUGATION",
      value: conjugationRate,
      setValue: setConjugationRate,
      min: 0,
      max: 0.03,
      step: 0.001,
      display: (v: number) => `${(v * 100).toFixed(1)}%`,
      desc: "Plasmid exchange rate. Resistant cells pass resistance to nearby susceptible cells via pilus."
    },
    {
      label: "FITNESS COST",
      value: fitnessCostMultiplier,
      setValue: setFitnessCostMultiplier,
      min: 1.0,
      max: 3.0,
      step: 0.1,
      display: (v: number) => `${v.toFixed(1)}X`,
      desc: "Metabolic cost of resistance. Resistant cells divide this many times slower than wild type."
    },
  ];

  const renderControl = (ctrl: ControlConfig) => (
    <div
      key={ctrl.label}
      className="flex flex-col gap-1.5"
      onMouseEnter={() => setDescription(ctrl.desc)}
      onMouseLeave={() => setDescription("INITIALIZED")}
    >
      <div className="flex justify-between items-baseline border-b border-black/10 pb-1">
        <label className="font-bold tracking-tighter text-black truncate">
          {ctrl.label}
        </label>
        <span className="font-bold text-black/40 ml-1 shrink-0">
          {ctrl.display(ctrl.value)}
        </span>
      </div>
      <input
        type="range"
        min={ctrl.min}
        max={ctrl.max}
        step={ctrl.step}
        value={ctrl.value}
        onChange={(e) => ctrl.setValue(parseFloat(e.target.value))}
        className="w-full h-px bg-black appearance-none cursor-pointer accent-black hover:h-1 transition-all"
      />
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-5 pt-4 sm:pt-6 font-mono text-[10px] uppercase">
      {/* Description / Status */}
      <div className="flex items-start gap-1.5 text-[9px] tracking-wider text-[var(--ink-black)] opacity-60 min-h-[3rem]">
        <Info size={10} strokeWidth={3} className="shrink-0 mt-0.5" />
        <span className="leading-tight">{description}</span>
      </div>

      {/* Base Controls */}
      <div className="flex flex-col gap-5">
        {controls.map(renderControl)}
      </div>

      {/* Advanced Mode Toggle */}
      <div className="border-t border-black/10 pt-4 mt-1">
        <button
          onClick={() => setAdvancedMode(!advancedMode)}
          className="flex items-center gap-2 w-full group"
        >
          <div className={`relative w-7 h-3.5 rounded-full transition-colors duration-200 ${advancedMode ? "bg-[var(--accent-rust)]" : "bg-black/20"}`}>
            <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${advancedMode ? "translate-x-3.5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-[9px] font-bold tracking-tight leading-tight text-left">
            IT&apos;S MORE COMPLICATED
          </span>
        </button>
      </div>

      {/* Advanced Controls (conditional) */}
      {advancedMode && (
        <div className="flex flex-col gap-5">
          {advancedControls.map(renderControl)}

          {/* Gradient — read-only indicator */}
          <div
            className="flex flex-col gap-1.5"
            onMouseEnter={() => setDescription("Sub-lethal gradient zones. Inner zone is lethal; outer halo boosts mutation rate 10x, breeding resistant colonies at the edge.")}
            onMouseLeave={() => setDescription("INITIALIZED")}
          >
            <div className="flex justify-between items-baseline border-b border-black/10 pb-1">
              <label className="font-bold tracking-tighter text-black truncate">
                GRADIENT
              </label>
              <span className="font-bold text-[var(--accent-rust)] ml-1 shrink-0">
                ON
              </span>
            </div>
            <div className="text-[8px] opacity-40 leading-tight normal-case">
              Antibiotic discs now have a lethal core and a stress halo that accelerates mutation.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ControlDeck;
