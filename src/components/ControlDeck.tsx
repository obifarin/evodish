import React, { useState } from "react";
import { Info } from "lucide-react";
import {
  ControlDefinition,
  ControlKey,
  EXPERIMENT_MODE_DESCRIPTION,
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
        className="control-field"
        onMouseEnter={() => setDescription(control.shortDescription)}
        onMouseLeave={() => setDescription(INITIAL_CONTROL_MESSAGE)}
      >
        <div className="flex justify-between items-baseline border-b border-black/10 pb-1">
          <label htmlFor={`control-${control.key}`} className="font-bold tracking-tighter text-black truncate">
            {control.label}
          </label>
          <span className="control-value">
            {control.formatValue(binding.value)}
          </span>
        </div>
        <input
          id={`control-${control.key}`}
          onFocus={() => setDescription(control.shortDescription)}
          onBlur={() => setDescription(INITIAL_CONTROL_MESSAGE)}
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={binding.value}
          onChange={(event) => binding.setValue(parseFloat(event.target.value))}
          className="control-slider"
        />
      </div>
    );
  };

  return (
    <div className="control-deck">
      <span className="eyebrow">02 / CONDITIONS</span>
      <h2 className="panel-title">Shape the culture</h2>
      <fieldset><legend>Population</legend>
        {baseControlDefinitions.filter(control => ["mutationRate", "reproductionChance", "maxAge", "maxPopulation"].includes(control.key)).map(renderControl)}
      </fieldset>
      <fieldset><legend>Environment</legend>
        {baseControlDefinitions.filter(control => ["discRadius", "movementSpeed"].includes(control.key)).map(renderControl)}
      </fieldset>
      {advancedMode && <fieldset><legend>Gene transfer</legend>
        {advancedControlDefinitions.map(renderControl)}
        <p className="control-note">Stress halo raises susceptible mutation chance 10×.</p>
      </fieldset>}
      <fieldset><legend>Experiment</legend>
        <button className="auto-stop-toggle" aria-pressed={isExperimentMode}
          onClick={() => setIsExperimentMode(!isExperimentMode)}
          onMouseEnter={() => setDescription(EXPERIMENT_MODE_DESCRIPTION)}
          onMouseLeave={() => setDescription(INITIAL_CONTROL_MESSAGE)}>
          <span>Auto-stop</span><span>{isExperimentMode ? "ON" : "OFF"}</span>
        </button>
        {isExperimentMode && renderControl(experimentControlDefinitions[0])}
      </fieldset>
      <div className="control-description"><Info size={14} aria-hidden="true" /><p>{description}</p></div>
    </div>
  );
};

export default ControlDeck;
