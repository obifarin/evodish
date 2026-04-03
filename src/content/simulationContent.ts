import { SimulationParameters } from "@/types";

export type ControlKey =
  | "mutationRate"
  | "reproductionChance"
  | "maxAge"
  | "maxPopulation"
  | "discRadius"
  | "movementSpeed"
  | "conjugationRate"
  | "fitnessCostMultiplier"
  | "stopFrame";

export interface ControlDefinition {
  key: ControlKey;
  label: string;
  summaryLabel: string;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  shortDescription: string;
  methodsDescription: string;
}

export const INITIAL_CONTROL_MESSAGE = "INITIALIZED";

export const ADVANCED_MODE_DESCRIPTION =
  "Advanced mode adds conjugation, a fitness cost for resistance, and a two-zone antibiotic model with a lethal core plus a stress halo.";

export const GRADIENT_DESCRIPTION =
  "Sub-lethal gradient zones. Inner zone is lethal; outer halo boosts mutation rate 10x, breeding resistant colonies at the edge.";

export const EXPERIMENT_MODE_DESCRIPTION =
  "AUTO-STOP: The simulation will automatically freeze when it reaches the specified frame limit.";

export const baseControlDefinitions: ControlDefinition[] = [
  {
    key: "mutationRate",
    label: "MUTATION",
    summaryLabel: "Mutation rate",
    min: 0,
    max: 0.2,
    step: 0.01,
    formatValue: (value) => `${(value * 100).toFixed(0)}%`,
    shortDescription:
      "GENOME STABILITY: Probability of a bacterium developing resistance during division.",
    methodsDescription:
      "Controls the chance that a susceptible parent produces a resistant offspring during division. In EvoDish this rate is intentionally much higher than real biological mutation rates so resistance appears on screen within a short session.",
  },
  {
    key: "reproductionChance",
    label: "GROWTH RATE",
    summaryLabel: "Growth rate",
    min: 0,
    max: 0.05,
    step: 0.001,
    formatValue: (value) => `${(value * 100).toFixed(1)}%`,
    shortDescription: "How quickly the population divides and grows.",
    methodsDescription:
      "Controls the per-frame chance that an old-enough cell divides. Faster growth fills empty space more quickly and also creates more opportunities for mutation because mutations only happen when cells reproduce.",
  },
  {
    key: "maxAge",
    label: "LIFESPAN",
    summaryLabel: "Lifespan",
    min: 100,
    max: 2000,
    step: 50,
    formatValue: (value) => `${value}F`,
    shortDescription:
      "Natural lifespan in frames. A cell dies of old age once it reaches this limit, regardless of how many times it has divided.",
    methodsDescription:
      "Sets the age limit for each cell in frames. This is a simulation convenience that keeps turnover happening even without antibiotics; it is not meant to represent a precise bacterial life cycle.",
  },
  {
    key: "maxPopulation",
    label: "CAPACITY",
    summaryLabel: "Capacity",
    min: 100,
    max: 3000,
    step: 50,
    formatValue: (value) => `${value}`,
    shortDescription: "Maximum number of cells the dish can hold.",
    methodsDescription:
      "Sets a hard cap on how many cells the dish can contain. This stands in for crowding and limited resources, but it is much simpler than a true nutrient or space competition model.",
  },
  {
    key: "discRadius",
    label: "DRUG STR.",
    summaryLabel: "Drug radius",
    min: 20,
    max: 100,
    step: 5,
    formatValue: (value) => `${value}PX`,
    shortDescription: "Radius of the antibiotic kill area around a disc.",
    methodsDescription:
      "Controls the size of the antibiotic zone created when you click the dish. Larger discs expose more cells to lethal pressure, but EvoDish models that pressure as fixed circles rather than true diffusion gradients or changing concentration over time.",
  },
  {
    key: "movementSpeed",
    label: "MOTION",
    summaryLabel: "Motion",
    min: 0.1,
    max: 4,
    step: 0.1,
    formatValue: (value) => `${value.toFixed(1)}X`,
    shortDescription: "Speed of bacterial movement and mixing.",
    methodsDescription:
      "Controls how far cells drift in a random direction each frame. This creates mixing and contact opportunities, but it is more like a teaching abstraction than realistic colony growth on agar.",
  },
];

export const advancedControlDefinitions: ControlDefinition[] = [
  {
    key: "conjugationRate",
    label: "CONJUGATION",
    summaryLabel: "Conjugation rate",
    min: 0,
    max: 0.03,
    step: 0.001,
    formatValue: (value) => `${(value * 100).toFixed(1)}%`,
    shortDescription:
      "Plasmid exchange rate. Resistant cells pass resistance to nearby susceptible cells via pilus.",
    methodsDescription:
      "Controls how often nearby resistant cells convert susceptible neighbors in advanced mode. This captures the idea of horizontal gene transfer through contact, while simplifying away plasmid compatibility, species differences, and other molecular constraints.",
  },
  {
    key: "fitnessCostMultiplier",
    label: "FITNESS COST",
    summaryLabel: "Fitness cost",
    min: 1,
    max: 3,
    step: 0.1,
    formatValue: (value) => `${value.toFixed(1)}X`,
    shortDescription:
      "Metabolic cost of resistance. Resistant cells divide this many times slower than wild type.",
    methodsDescription:
      "Slows resistant reproduction by dividing the base growth chance by this multiplier. This models the idea that resistance can be useful under antibiotics but costly when drugs are absent.",
  },
];

export const experimentControlDefinitions: ControlDefinition[] = [
  {
    key: "stopFrame",
    label: "LIMIT",
    summaryLabel: "Auto-stop limit",
    min: 1000,
    max: 10000,
    step: 500,
    formatValue: (value) => `${value}F`,
    shortDescription:
      "The specific frame at which the simulation will auto-pause.",
    methodsDescription:
      "Sets the frame where experiment mode pauses the run automatically. This is a measurement tool for comparing runs, not a biological variable.",
  },
];

export const getControlValue = (
  parameters: SimulationParameters,
  key: ControlKey,
) => parameters[key];
