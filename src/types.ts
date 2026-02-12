import P5 from "p5";

export interface Bacterium {
  pos: P5.Vector;
  vel: P5.Vector;
  health: number;
  isResistant: boolean;
  age: number;
}

export interface AntibioticDisc {
  pos: P5.Vector;
  radius: number;
}