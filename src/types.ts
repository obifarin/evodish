import type { SketchProps } from "react-p5";

// Match the p5 instance supplied by react-p5 (which bundles its own p5 types).
type SimulationVector = ReturnType<Parameters<SketchProps["setup"]>[0]["createVector"]>;

export interface Bacterium {
  pos: SimulationVector;
  vel: SimulationVector;
  health: number;
  isResistant: boolean;
  age: number;
  lastReproduced: number;
}

export interface AntibioticDisc {
  pos: SimulationVector;
  radius: number;
}

export interface ConjugationLine {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  framesLeft: number;
  donor?: Bacterium;
  recipient?: Bacterium;
}

export interface PopulationSnapshot {
  susceptible: number;
  resistant: number;
}

export interface SimulationParameters {
  mutationRate: number;
  reproductionChance: number;
  maxPopulation: number;
  maxAge: number;
  discRadius: number;
  movementSpeed: number;
  advancedMode: boolean;
  conjugationRate: number;
  fitnessCostMultiplier: number;
  isExperimentMode: boolean;
  stopFrame: number;
}
