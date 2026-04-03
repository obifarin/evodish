"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Bacterium, AntibioticDisc, ConjugationLine } from "@/types";

// Dynamically import Sketch to avoid SSR issues with p5
const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

interface PetriDishProps {
  resetSignal: number;
  paused: boolean;
  onStatsUpdate: (susceptible: number, resistant: number) => void;
  onFrameUpdate: (frame: number) => void;
  onHgtUpdate: (count: number) => void;
  mutationRate: number;
  reproductionChance: number;
  maxPopulation: number;
  maxAge: number;
  discRadius: number;
  movementSpeed: number;
  advancedMode: boolean;
  conjugationRate: number;
  fitnessCostMultiplier: number;
}

// Fixed internal canvas size — simulation always runs at this resolution
const CANVAS_SIZE = 520;
const DISH_RADIUS = 240;
const SPATIAL_CELL_SIZE = 16;
const REPRODUCTION_COOLDOWN = 100; // Minimum frames between divisions

const PetriDish: React.FC<PetriDishProps> = ({
  resetSignal,
  paused,
  onStatsUpdate,
  onFrameUpdate,
  onHgtUpdate,
  mutationRate,
  reproductionChance,
  maxPopulation,
  maxAge,
  discRadius,
  movementSpeed,
  advancedMode,
  conjugationRate,
  fitnessCostMultiplier,
}) => {
  const p5Ref = useRef<any>(null);
  const bacteriaRef = useRef<Bacterium[]>([]);
  const discsRef = useRef<AntibioticDisc[]>([]);
  const conjugationLinesRef = useRef<ConjugationLine[]>([]);
  const agarTextureRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simFrameRef = useRef(0);
  const hgtTotalRef = useRef(0);
  const [cssScale, setCssScale] = useState(1);

  const paramsRef = useRef({
    mutationRate,
    reproductionChance,
    maxPopulation,
    maxAge,
    discRadius,
    movementSpeed,
    advancedMode,
    conjugationRate,
    fitnessCostMultiplier,
    paused,
  });

  useEffect(() => {
    paramsRef.current = {
      mutationRate,
      reproductionChance,
      maxPopulation,
      maxAge,
      discRadius,
      movementSpeed,
      advancedMode,
      conjugationRate,
      fitnessCostMultiplier,
      paused,
    };
  }, [mutationRate, reproductionChance, maxPopulation, maxAge, discRadius, movementSpeed, advancedMode, conjugationRate, fitnessCostMultiplier, paused]);

  // Measure container and compute CSS scale factor
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const fitSize = Math.min(rect.width, rect.height);
        setCssScale(Math.min(fitSize / CANVAS_SIZE, 1));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    const timer = setTimeout(measure, 100);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(timer);
    };
  }, []);

  const initSimulation = useCallback((p5: any) => {
    discsRef.current = [];
    conjugationLinesRef.current = [];
    simFrameRef.current = 0;
    hgtTotalRef.current = 0;
    onFrameUpdate(0);
    onHgtUpdate(0);
    const population: Bacterium[] = [];
    for (let i = 0; i < 50; i++) {
      let pos;
      do {
        pos = p5.createVector(p5.random(-DISH_RADIUS, DISH_RADIUS), p5.random(-DISH_RADIUS, DISH_RADIUS));
      } while (pos.magSq() > DISH_RADIUS * DISH_RADIUS);

      population.push({
        pos: pos,
        vel: p5.createVector(0, 0),
        health: 100,
        isResistant: false,
        age: 0,
        lastReproduced: 0,
      });
    }
    bacteriaRef.current = population;
  }, [onFrameUpdate, onHgtUpdate]);

  useEffect(() => {
    if (p5Ref.current) {
      initSimulation(p5Ref.current);
    }
  }, [resetSignal, initSimulation]);

  const setup = (p5: any, canvasParentRef: Element) => {
    p5.createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent(canvasParentRef);

    // Create static noise texture
    const texSize = DISH_RADIUS * 2 + 20;
    const gfx = p5.createGraphics(texSize, texSize);
    gfx.translate(texSize / 2, texSize / 2);
    gfx.background("#EBE8DD");
    gfx.noStroke();

    for (let i = 0; i < 20000; i++) {
      const r = DISH_RADIUS * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      gfx.fill(0, 0, 0, 10);
      gfx.circle(x, y, 1.5);
    }
    agarTextureRef.current = gfx;

    p5Ref.current = p5;
    initSimulation(p5);
  };

  const mousePressed = (p5: any) => {
    const cx = p5.mouseX - CANVAS_SIZE / 2;
    const cy = p5.mouseY - CANVAS_SIZE / 2;

    if (cx * cx + cy * cy < DISH_RADIUS * DISH_RADIUS) {
      discsRef.current.push({
        pos: p5.createVector(cx, cy),
        radius: paramsRef.current.discRadius,
      });
    }
  };

  const draw = (p5: any) => {
    p5.clear();
    p5.background("#EBE8DD");

    p5.push();
    p5.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    // Dish body
    if (agarTextureRef.current) {
      p5.imageMode(p5.CENTER);
      p5.image(agarTextureRef.current, 0, 0);
    }

    // Border
    p5.noFill();
    p5.stroke("#1A1A1A");
    p5.strokeWeight(1);
    p5.circle(0, 0, DISH_RADIUS * 2);

    const params = paramsRef.current;
    const discs = discsRef.current;

    // ── Draw Antibiotic Discs ──
    for (const disc of discs) {
      if (params.advancedMode) {
        const haloExtra = 20;
        const outerRadius = disc.radius + haloExtra;
        const ctx = p5.drawingContext as CanvasRenderingContext2D;
        ctx.save();
        const grad = ctx.createRadialGradient(
          disc.pos.x, disc.pos.y, disc.radius,
          disc.pos.x, disc.pos.y, outerRadius
        );
        grad.addColorStop(0, "rgba(26, 26, 26, 0.15)");
        grad.addColorStop(1, "rgba(26, 26, 26, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(disc.pos.x, disc.pos.y, outerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p5.fill(26, 26, 26, 30);
        p5.stroke("#1A1A1A");
        p5.strokeWeight(1);
        p5.drawingContext.setLineDash([5, 5]);
        p5.circle(disc.pos.x, disc.pos.y, disc.radius * 2);
        p5.drawingContext.setLineDash([]);
        p5.noFill();
        p5.stroke(26, 26, 26, 40);
        p5.strokeWeight(0.5);
        p5.drawingContext.setLineDash([3, 4]);
        p5.circle(disc.pos.x, disc.pos.y, outerRadius * 2);
        p5.drawingContext.setLineDash([]);
      } else {
        p5.fill(26, 26, 26, 30);
        p5.stroke("#1A1A1A");
        p5.strokeWeight(1);
        p5.drawingContext.setLineDash([5, 5]);
        p5.circle(disc.pos.x, disc.pos.y, disc.radius * 2);
        p5.drawingContext.setLineDash([]);
      }
    }

    const bacteria = bacteriaRef.current;

    // ── Draw bacteria (always, even when paused) ──
    for (const b of bacteria) {
      if (b.isResistant) {
        p5.fill("#D16B4D");
        p5.noStroke();
        p5.circle(b.pos.x, b.pos.y, 10);
      } else {
        p5.noFill();
        p5.stroke("#2F4B3F");
        p5.strokeWeight(2);
        p5.circle(b.pos.x, b.pos.y, 6);
      }
    }

    // ── Skip simulation updates when paused ──
    if (!params.paused) {
      simFrameRef.current++;
      onFrameUpdate(simFrameRef.current);

      // ── Spatial Hash Grid (for conjugation proximity checks) ──
      let spatialHash: Record<string, Bacterium[]> | null = null;
      if (params.advancedMode) {
        spatialHash = {};
        for (const b of bacteria) {
          const cx = Math.floor((b.pos.x + DISH_RADIUS) / SPATIAL_CELL_SIZE);
          const cy = Math.floor((b.pos.y + DISH_RADIUS) / SPATIAL_CELL_SIZE);
          const key = `${cx},${cy}`;
          if (!spatialHash[key]) spatialHash[key] = [];
          spatialHash[key].push(b);
        }
      }

      // ── Conjugation (Horizontal Gene Transfer) ──
      if (params.advancedMode && spatialHash && simFrameRef.current % 3 === 0) {
        const toConvert = new Set<Bacterium>();
        const newLines: ConjugationLine[] = [];
        const keys = Object.keys(spatialHash);

        for (const key of keys) {
          const cell = spatialHash[key];
          const [cellX, cellY] = key.split(",").map(Number);

          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const neighborKey = `${cellX + dx},${cellY + dy}`;
              const neighbors = spatialHash[neighborKey];
              if (!neighbors) continue;

              for (const a of cell) {
                if (!a.isResistant) continue; // only resistant initiate transfer
                for (const b of neighbors) {
                  if (b.isResistant || a === b) continue; // only susceptible targets
                  if (toConvert.has(b)) continue; // already marked

                  const distX = a.pos.x - b.pos.x;
                  const distY = a.pos.y - b.pos.y;
                  // 8px proximity = 64 squared distance
                  if (distX * distX + distY * distY < 64 && p5.random(1) < params.conjugationRate) {
                    toConvert.add(b);
                    hgtTotalRef.current++;
                    onHgtUpdate(hgtTotalRef.current);
                    newLines.push({
                      fromX: a.pos.x,
                      fromY: a.pos.y,
                      toX: b.pos.x,
                      toY: b.pos.y,
                      framesLeft: 24,
                    });
                  }
                }
              }
            }
          }
        }

        // Apply conversions after iteration
        for (const b of toConvert) {
          b.isResistant = true;
          b.lastReproduced = b.age; // reset reproduction timer for newly resistant
        }
        conjugationLinesRef.current.push(...newLines);
      }

      // ── Main Simulation Loop ──
      const survivors: Bacterium[] = [];
      const newBacteria: Bacterium[] = [];

      for (const b of bacteria) {
        let isDead = false;
        let inStressZone = false;

        // Kill zone check (susceptible only)
        if (!b.isResistant) {
          for (const disc of discs) {
            const dx = b.pos.x - disc.pos.x;
            const dy = b.pos.y - disc.pos.y;
            const distSq = dx * dx + dy * dy;

            if (params.advancedMode) {
              // Gradient kill zones: inner = full disc (lethal), outer = +20px halo (stress)
              const innerRadiusSq = disc.radius * disc.radius;
              const haloExtra = 20;
              const outerRadius = disc.radius + haloExtra;
              const outerRadiusSq = outerRadius * outerRadius;

              if (distSq < innerRadiusSq) {
                b.health -= 10; // Zone A: lethal — Increased damage to prevent "tanking"
              } else if (distSq < outerRadiusSq) {
                inStressZone = true; // Zone B: stress halo — 10x mutation boost
              }
            } else {
              // Original: flat kill zone
              if (distSq < disc.radius * disc.radius) {
                b.health -= 10;
              }
            }
          }
          if (b.health <= 0) isDead = true;
        }

        // Natural death (Old Age)
        // Removed metabolic burden on lifespan to avoid double-penalizing resistance
        if (b.age > params.maxAge) {
          isDead = true;
        }

        if (!isDead) {
          // Movement
          const vx = p5.random(-1, 1) * params.movementSpeed;
          const vy = p5.random(-1, 1) * params.movementSpeed;
          b.vel = p5.createVector(vx, vy);
          b.pos.add(b.vel);

          const boundaryRadius = DISH_RADIUS - 10;
          if (b.pos.magSq() > boundaryRadius * boundaryRadius) {
            b.pos.setMag(boundaryRadius);
          }

          b.age++;

          // Reproduction
          if (bacteria.length + newBacteria.length < params.maxPopulation) {
            let shouldReproduce = false;

            // CHECK COOLDOWN: Must have waited enough frames since last division
            if (b.age - b.lastReproduced > REPRODUCTION_COOLDOWN) {
              if (params.advancedMode) {
                // Fitness cost: resistant bacteria reproduce slower by fitnessCostMultiplier
                const effectiveChance = b.isResistant
                  ? params.reproductionChance / params.fitnessCostMultiplier
                  : params.reproductionChance;
                shouldReproduce = p5.random(1) < effectiveChance;
              } else {
                shouldReproduce = p5.random(1) < params.reproductionChance;
              }
            }

            if (shouldReproduce) {
              let offspringResistant = b.isResistant;
              if (!b.isResistant) {
                // Stress zone boosts mutation rate by 10x
                const effectiveMutationRate = (params.advancedMode && inStressZone)
                  ? params.mutationRate * 10
                  : params.mutationRate;
                if (p5.random(1) < effectiveMutationRate) {
                  offspringResistant = true;
                }
              }

              newBacteria.push({
                pos: b.pos.copy(),
                vel: p5.createVector(0, 0),
                health: 100,
                isResistant: offspringResistant,
                age: 0,
                lastReproduced: 0,
              });
              b.lastReproduced = b.age;
            }
          }

          survivors.push(b);
        }
      }

      bacteriaRef.current = [...survivors, ...newBacteria];

      // ── Draw Conjugation Lines (pilus visual) — drawn ON TOP of bacteria ──
      if (params.advancedMode) {
        const lines = conjugationLinesRef.current;
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i];
          const t = line.framesLeft / 24; // normalized 0→1
          // Bright magenta pilus line for high contrast
          p5.stroke(255, 60, 172, t * 255);
          p5.strokeWeight(2.5);
          p5.line(line.fromX, line.fromY, line.toX, line.toY);
          // Dot at each end for emphasis
          p5.noStroke();
          p5.fill(255, 60, 172, t * 240);
          p5.circle(line.fromX, line.fromY, 5);
          p5.circle(line.toX, line.toY, 5);
          line.framesLeft--;
          if (line.framesLeft <= 0) {
            lines.splice(i, 1);
          }
        }
      }

      if (simFrameRef.current % 10 === 0) {
        const susceptible = bacteriaRef.current.filter(b => !b.isResistant).length;
        const resistant = bacteriaRef.current.length - susceptible;
        onStatsUpdate(susceptible, resistant);
      }
    } // end if (!params.paused)

    p5.pop();
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div style={{
        transform: `scale(${cssScale})`,
        transformOrigin: "center center",
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        flexShrink: 0
      }}>
        <Sketch setup={setup} draw={draw} mousePressed={mousePressed} />
      </div>
    </div>
  );
};

export default PetriDish;
