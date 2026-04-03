import P5 from "p5";

export interface Bacterium {
  pos: P5.Vector;
  vel: P5.Vector;
  health: number;
  isResistant: boolean;
  age: number;
  lastReproduced: number;
}

export interface AntibioticDisc {
  pos: P5.Vector;
  radius: number;
}

export interface ConjugationLine {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  framesLeft: number;
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
