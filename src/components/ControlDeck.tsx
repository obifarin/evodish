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
      max: 2000,
      step: 50,
      display: (v: number) => `${v}`,
      desc: "Maximum number of cells the dish can hold."
    },
    {
      label: "DRUG STR.",
      value: discRadius,
      setValue: setDiscRadius,
      min: 20,
      max: 150,
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

  return (
    <div className="h-full flex flex-col gap-5 pt-4 sm:pt-6 font-mono text-[10px] uppercase">
      {/* Description / Status */}
      <div className="flex items-start gap-1.5 text-[9px] tracking-wider text-[var(--ink-black)] opacity-60 min-h-[3rem]">
        <Info size={10} strokeWidth={3} className="shrink-0 mt-0.5" />
        <span className="leading-tight">{description}</span>
      </div>

      {/* Vertical Controls */}
      <div className="flex flex-col gap-5">
        {controls.map((ctrl) => (
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
        ))}
      </div>

      {/* Reset Button */}
      <div className="mt-auto pb-4">
        <button
          onClick={onReset}
          className="group flex items-center gap-2 font-mono text-[9px] font-bold uppercase hover:text-[var(--accent-rust)] transition-colors"
        >
          <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
          <span>RESET</span>
        </button>
      </div>
    </div>
  );
};

export default ControlDeck;
