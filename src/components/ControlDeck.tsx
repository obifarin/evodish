import React, { useState } from "react";
import { Info } from "lucide-react";

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
  const [description, setDescription] = useState<string>("HOVER OVER A PARAMETER TO SEE DETAILS //");

  const controls = [
    {
      label: "MUTATION",
      value: mutationRate,
      setValue: setMutationRate,
      min: 0,
      max: 0.2,
      step: 0.01,
      display: (v: number) => `${(v * 100).toFixed(1)}%`,
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
      label: "DRUG STRENGTH",
      value: discRadius,
      setValue: setDiscRadius,
      min: 20,
      max: 150,
      step: 5,
      display: (v: number) => `${v}px`,
      desc: "DOSAGE: The radius of the 'Kill Zone' for antibiotic discs."
    },
    {
      label: "TEMP",
      value: movementSpeed,
      setValue: setMovementSpeed,
      min: 0.1,
      max: 4.0,
      step: 0.1,
      display: (v: number) => `${v.toFixed(1)}x`,
      desc: "KINETIC ENERGY: Speed of bacterial movement. Affects mixing and spreading."
    },
  ];

  return (
    <div className="z-10 w-full max-w-4xl bg-white/80 backdrop-blur-md border-2 border-[var(--ink-primary)] rounded-[var(--radius-lg)] p-4 shadow-lg flex flex-col gap-4">
      {/* Top Row: Reset & Active Description */}
      <div className="flex justify-between items-center border-b border-[var(--ink-secondary)] pb-2 mb-2">
        <button 
          onClick={onReset}
          className="font-mono text-sm font-bold text-[var(--alert-red)] hover:bg-[var(--alert-red)] hover:text-white px-3 py-1 rounded transition-colors"
        >
          [ RESET SAMPLE ]
        </button>
        <div className="font-mono text-xs text-[var(--ink-secondary)] flex items-center gap-2">
           <Info size={14} />
           <span>{description}</span>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {controls.map((ctrl) => (
          <div 
            key={ctrl.label} 
            className="flex flex-col gap-1 group"
            onMouseEnter={() => setDescription(ctrl.desc)}
            onMouseLeave={() => setDescription("HOVER OVER A PARAMETER TO SEE DETAILS //")}
          >
            <div className="flex justify-between items-end">
                <label className="font-mono text-xs font-bold tracking-wider text-[var(--ink-primary)]">
                    {ctrl.label}
                </label>
                <span className="font-mono text-xs text-[var(--sterile-blue)]">
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
                className="w-full h-1 bg-[var(--ink-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--ink-primary)] hover:accent-[var(--sterile-blue)] transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlDeck;