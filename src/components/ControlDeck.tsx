import React, { useState } from "react";
import { Info } from "lucide-react";
import {
  ADVANCED_MODE_DESCRIPTION,
  ControlDefinition,
  ControlKey,
  EXPERIMENT_MODE_DESCRIPTION,
  GRADIENT_DESCRIPTION,
  INITIAL_CONTROL_MESSAGE,
  advancedControlDefinitions,
  baseControlDefinitions,
  experimentControlDefinitions,
} from "@/content/simulationContent";
import { SimulationParameters } from "@/types";

interface ControlDeckProps {
  mutationRate: number;
  setMutationRate: (rate: number) => void;
  reproductionChance: number;
  setReproductionChance: (rate: number) => void;
  maxPopulation: number;
  setMaxPopulation: (count: number) => void;
  maxAge: number;
  setMaxAge: (age: number) => void;
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
  isExperimentMode: boolean;
  setIsExperimentMode: (mode: boolean) => void;
  stopFrame: number;
  setStopFrame: (frame: number) => void;
}

const ControlDeck: React.FC<ControlDeckProps> = ({
  mutationRate,
  setMutationRate,
  reproductionChance,
  setReproductionChance,
  maxPopulation,
  setMaxPopulation,
  maxAge,
  setMaxAge,
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
  isExperimentMode,
  setIsExperimentMode,
  stopFrame,
  setStopFrame,
}) => {
  const [description, setDescription] = useState<string>(INITIAL_CONTROL_MESSAGE);

  const parameters: SimulationParameters = {
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

  const bindings: Record<ControlKey, { value: number; setValue: (value: number) => void }> = {
    mutationRate: { value: parameters.mutationRate, setValue: setMutationRate },
    reproductionChance: {
      value: parameters.reproductionChance,
      setValue: setReproductionChance,
    },
    maxAge: { value: parameters.maxAge, setValue: setMaxAge },
    maxPopulation: { value: parameters.maxPopulation, setValue: setMaxPopulation },
    discRadius: { value: parameters.discRadius, setValue: setDiscRadius },
    movementSpeed: { value: parameters.movementSpeed, setValue: setMovementSpeed },
    conjugationRate: {
      value: parameters.conjugationRate,
      setValue: setConjugationRate,
    },
    fitnessCostMultiplier: {
      value: parameters.fitnessCostMultiplier,
      setValue: setFitnessCostMultiplier,
    },
    stopFrame: { value: parameters.stopFrame, setValue: setStopFrame },
  };

  const renderControl = (control: ControlDefinition) => {
    const binding = bindings[control.key];

    return (
      <div
        key={control.label}
        className="flex flex-col gap-1.5"
        onMouseEnter={() => setDescription(control.shortDescription)}
        onMouseLeave={() => setDescription(INITIAL_CONTROL_MESSAGE)}
      >
        <div className="flex justify-between items-baseline border-b border-black/10 pb-1">
          <label className="font-bold tracking-tighter text-black truncate">
            {control.label}
          </label>
          <span className="font-bold text-black/40 ml-1 shrink-0">
            {control.formatValue(binding.value)}
          </span>
        </div>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={binding.value}
          onChange={(event) => binding.setValue(parseFloat(event.target.value))}
          className="w-full h-px bg-black appearance-none cursor-pointer accent-black hover:h-1 transition-all"
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-5 pt-4 sm:pt-6 font-mono text-[10px] uppercase">
      <div className="flex items-start gap-1.5 text-[9px] tracking-wider text-[var(--ink-black)] opacity-60 min-h-[3rem]">
        <Info size={10} strokeWidth={3} className="shrink-0 mt-0.5" />
        <span className="leading-tight">{description}</span>
      </div>

      <div className="flex flex-col gap-5">
        {baseControlDefinitions.map(renderControl)}
      </div>

      <div className="border-t border-black/10 pt-4 mt-1">
        <button
          onClick={() => setAdvancedMode(!advancedMode)}
          onMouseEnter={() => setDescription(ADVANCED_MODE_DESCRIPTION)}
          onMouseLeave={() => setDescription(INITIAL_CONTROL_MESSAGE)}
          className="flex items-center gap-2 w-full group"
        >
          <div
            className={`relative w-7 h-3.5 rounded-full transition-colors duration-200 ${
              advancedMode ? "bg-[var(--accent-rust)]" : "bg-black/20"
            }`}
          >
            <div
              className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                advancedMode ? "translate-x-3.5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-[9px] font-bold tracking-tight leading-tight text-left">
            IT&apos;S MORE COMPLICATED
          </span>
        </button>
      </div>

      {advancedMode && (
        <div className="flex flex-col gap-5">
          {advancedControlDefinitions.map(renderControl)}

          <div
            className="flex flex-col gap-1.5"
            onMouseEnter={() => setDescription(GRADIENT_DESCRIPTION)}
            onMouseLeave={() => setDescription(INITIAL_CONTROL_MESSAGE)}
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
              Antibiotic discs now have a lethal core and a stress halo that
              accelerates mutation.
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-black/10 pt-4 mt-auto">
        <h3 className="font-bold text-black/30 mb-3 tracking-widest">
          LAB PROTOCOL
        </h3>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setIsExperimentMode(!isExperimentMode)}
            onMouseEnter={() => setDescription(EXPERIMENT_MODE_DESCRIPTION)}
            onMouseLeave={() => setDescription(INITIAL_CONTROL_MESSAGE)}
            className="flex items-center gap-2 w-full group"
          >
            <div
              className={`relative w-7 h-3.5 rounded-full transition-colors duration-200 ${
                isExperimentMode ? "bg-black" : "bg-black/20"
              }`}
            >
              <div
                className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isExperimentMode ? "translate-x-3.5" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-[9px] font-bold tracking-tight">AUTO-STOP</span>
          </button>

          {isExperimentMode && renderControl(experimentControlDefinitions[0])}
        </div>
      </div>
    </div>
  );
};

export default ControlDeck;
