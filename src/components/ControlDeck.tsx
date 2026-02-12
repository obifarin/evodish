import React, { useState } from "react";
import { Info, RotateCcw } from "lucide-react";

interface ControlDeckProps {
  onReset: () => void;
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
}

const ControlDeck: React.FC<ControlDeckProps> = ({
  onReset,
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
}) => {
  const [description, setDescription] = useState<string>("INITIALIZED");

  const controls = [
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
      label: "GROWTH",
      value: reproductionChance,
      setValue: setReproductionChance,
      min: 0,
      max: 0.05,
      step: 0.001,
      display: (v: number) => `${(v * 100).toFixed(1)}%`,
      desc: "REPLICATION SPEED: How frequently bacteria divide. Represents nutrient richness."
    },
    {
      label: "NUTRIENTS",
      value: maxPopulation,
      setValue: setMaxPopulation,
      min: 100,
      max: 2000,
      step: 50,
      display: (v: number) => `${v}`,
      desc: "CARRYING CAPACITY: Max population the dish can support. Simulates space/resources."
    },
    {
      label: "DRUG STR.",
      value: discRadius,
      setValue: setDiscRadius,
      min: 20,
      max: 150,
      step: 5,
      display: (v: number) => `${v}PX`,
      desc: "ANTIBIOTIC DOSAGE: The radius of the 'Kill Zone' for antibiotic discs."
    },
    {
      label: "TEMP",
      value: movementSpeed,
      setValue: setMovementSpeed,
      min: 0.1,
      max: 4.0,
      step: 0.1,
      display: (v: number) => `${v.toFixed(1)}X`,
      desc: "KINETIC ENERGY: Speed of bacterial movement. Affects mixing and spreading."
    },
  ];

  return (
    <div className="z-10 w-full max-w-6xl bg-transparent pt-3 flex flex-col gap-4">
      {/* Description / Status Bar */}
      <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-wider text-[var(--ink-black)] opacity-60">
        <div className="flex items-center gap-2">
          <Info size={12} strokeWidth={3} />
          <span className="truncate max-w-[250px] sm:max-w-none">{description}</span>
        </div>
      </div>

      {/* Controls Grid — responsive: 2-col on mobile, full row on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-4 items-end">
        {controls.map((ctrl) => (
          <div
            key={ctrl.label}
            className="flex flex-col gap-2 min-w-0"
            onMouseEnter={() => setDescription(ctrl.desc)}
            onMouseLeave={() => setDescription("INITIALIZED")}
          >
            <div className="flex justify-between items-baseline border-b border-black/10 pb-1">
              <label className="font-mono text-[10px] font-bold tracking-tighter text-black uppercase truncate">
                {ctrl.label}
              </label>
              <span className="font-mono text-[10px] font-bold text-black/40 ml-1 shrink-0">
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
        ))}

        {/* Reset Button */}
        <div className="flex flex-col justify-center items-center sm:items-end col-span-2 sm:col-span-1">
          <button
            onClick={onReset}
            className="group flex flex-col items-center gap-1 font-mono text-[9px] font-bold uppercase hover:text-[var(--accent-rust)] transition-colors"
          >
            <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlDeck;
