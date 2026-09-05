"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { SketchProps } from "react-p5";
import { DishRenderer, DISH_SIZE, AGAR_RADIUS, TRANSFER_HIGHLIGHT_TICKS } from "@/lib/dishRenderer";
import type { Bacterium, AntibioticDisc, ConjugationLine } from "@/types";

type P5 = Parameters<SketchProps["setup"]>[0];

// Dynamically import Sketch to avoid SSR issues with p5
const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

interface PetriDishProps {
  resetSignal: number;
  paused: boolean;
  onStatsUpdate: (susceptible: number, resistant: number) => void;
  onFrameUpdate: (frame: number) => boolean;
  onHgtUpdate: (frame: number | null) => void;
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
const CANVAS_SIZE = DISH_SIZE;
const DISH_RADIUS = AGAR_RADIUS;
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
  const p5Ref = useRef<P5 | null>(null);
  const bacteriaRef = useRef<Bacterium[]>([]);
  const discsRef = useRef<AntibioticDisc[]>([]);
  const conjugationLinesRef = useRef<ConjugationLine[]>([]);
  const rendererRef = useRef<DishRenderer | null>(null);
  const elapsedRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const keyboardRef = useRef(false);
  const [announcement, setAnnouncement] = useState("");
  const callbacksRef = useRef({ onFrameUpdate, onStatsUpdate, onHgtUpdate });
  useEffect(() => {
    callbacksRef.current = { onFrameUpdate, onStatsUpdate, onHgtUpdate };
  }, [onFrameUpdate, onStatsUpdate, onHgtUpdate]);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotionRef.current = query.matches; };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const simFrameRef = useRef(0);
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
        setCssScale(fitSize / CANVAS_SIZE);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  const initSimulation = useCallback((p5: P5) => {
    discsRef.current = [];
    conjugationLinesRef.current = [];
    simFrameRef.current = 0;
    elapsedRef.current = 0;
    rendererRef.current?.reset();
    cursorRef.current = null;
    setAnnouncement("Culture initialized with 50 susceptible cells; antibiotic discs cleared.");
    callbacksRef.current.onFrameUpdate(0);
    callbacksRef.current.onHgtUpdate(null);
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
    callbacksRef.current.onStatsUpdate(50, 0);
  }, []);

  useEffect(() => {
    if (p5Ref.current) {
      initSimulation(p5Ref.current);
    }
  }, [resetSignal, initSimulation]);

  const setup = (p5: P5, canvasParentRef: Element) => {
    p5.createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent(canvasParentRef);

    p5.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    p5.frameRate(60);
    rendererRef.current = new DishRenderer();

    p5Ref.current = p5;
    initSimulation(p5);
  };

  const placeDisc = (x: number, y: number) => {
    const p5 = p5Ref.current;
    if (!p5 || x * x + y * y >= DISH_RADIUS * DISH_RADIUS) return;
    discsRef.current.push({ pos: p5.createVector(x, y), radius: paramsRef.current.discRadius });
    setAnnouncement(`Antibiotic disc ${discsRef.current.length} placed at ${Math.round(x)}, ${Math.round(y)} relative to dish center.`);
  };

  const pointerPosition = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * CANVAS_SIZE / bounds.width - CANVAS_SIZE / 2,
      y: (event.clientY - bounds.top) * CANVAS_SIZE / bounds.height - CANVAS_SIZE / 2 };
  };

  // Biological probabilities and cooldowns remain per-tick. Drawing never consumes RNG.
  /* eslint-disable react-hooks/immutability -- This imperative tick mutates objects owned exclusively by simulation refs, never React state or props. */
  const tick = (p5: P5) => {
    const params = paramsRef.current;
    const discs = discsRef.current;
    const bacteria = bacteriaRef.current;
    // ── Skip simulation updates when paused ──
    if (!params.paused) {
      simFrameRef.current++;
      const shouldStop = callbacksRef.current.onFrameUpdate(simFrameRef.current);

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
                    newLines.push({
                      framesLeft: TRANSFER_HIGHLIGHT_TICKS,
                      donor: a,
                      recipient: b,
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
        if (newLines.length) {
          callbacksRef.current.onHgtUpdate(simFrameRef.current);
          // Bound visual overlays without limiting biological transfers.
          conjugationLinesRef.current = [...conjugationLinesRef.current, ...newLines].slice(-200);
        }
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
        } else {
          rendererRef.current?.recordDeath(b, simFrameRef.current);
        }
      }

      bacteriaRef.current = [...survivors, ...newBacteria];

      for (const line of conjugationLinesRef.current) line.framesLeft--;
      conjugationLinesRef.current = conjugationLinesRef.current.filter(line => line.framesLeft > 0);

      if (simFrameRef.current % 10 === 0 || shouldStop) {
        const susceptible = bacteriaRef.current.filter(b => !b.isResistant).length;
        const resistant = bacteriaRef.current.length - susceptible;
        callbacksRef.current.onStatsUpdate(susceptible, resistant);
      }
      if (shouldStop) paramsRef.current.paused = true;
    } // end if (!params.paused)
  };

  /* eslint-enable react-hooks/immutability */

  const draw = (p5: P5) => {
    // Catch up short rendering stalls, but never fast-forward time spent in a hidden tab.
    if (paramsRef.current.paused || document.hidden || p5.deltaTime > 250) elapsedRef.current = 0;
    else {
      elapsedRef.current += Math.min(p5.deltaTime, 100);
      const step = 1000 / 60;
      while (elapsedRef.current >= step && !paramsRef.current.paused) {
        tick(p5);
        elapsedRef.current -= step;
      }
    }
    rendererRef.current?.render(p5.drawingContext as CanvasRenderingContext2D,
      bacteriaRef.current, discsRef.current, conjugationLinesRef.current, simFrameRef.current,
      paramsRef.current.advancedMode, reducedMotionRef.current, cursorRef.current, paramsRef.current.discRadius);
  };

  return (
    <div ref={containerRef} className="dish-container">
      <div className="dish-interaction" role="button" tabIndex={0}
        aria-label="Petri dish. Arrow keys move the placement target; Enter or Space places antibiotic."
        aria-describedby="dish-help"
        onFocus={() => { keyboardRef.current = true; cursorRef.current = { x: 0, y: 0 }; }}
        onBlur={() => { keyboardRef.current = false; cursorRef.current = null; }}
        onKeyDown={event => {
          if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            const cursor = cursorRef.current || { x: 0, y: 0 };
            const step = event.shiftKey ? 25 : 10;
            const x = cursor.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0);
            const y = cursor.y + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0);
            if (x * x + y * y < DISH_RADIUS * DISH_RADIUS) {
              cursorRef.current = { x, y };
              setAnnouncement(`Placement target: ${x}, ${y} relative to dish center.`);
            }
            keyboardRef.current = true;
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!event.repeat) { const cursor = cursorRef.current || { x: 0, y: 0 }; placeDisc(cursor.x, cursor.y); }
          } else if (event.key === "Escape") cursorRef.current = null;
        }}
        onPointerMove={event => {
          if (event.pointerType === "touch") return;
          keyboardRef.current = false;
          const point = pointerPosition(event);
          cursorRef.current = point.x ** 2 + point.y ** 2 < DISH_RADIUS ** 2 ? point : null;
        }}
        onPointerLeave={() => { if (!keyboardRef.current) cursorRef.current = null; }}
        onClick={event => {
          // Pointer coordinates use the displayed bounds, including responsive scaling.
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.detail === 0) { const point = cursorRef.current || { x: 0, y: 0 }; placeDisc(point.x, point.y); return; }
          const point = { x: (event.clientX - bounds.left) * CANVAS_SIZE / bounds.width - 260,
            y: (event.clientY - bounds.top) * CANVAS_SIZE / bounds.height - 260 };
          cursorRef.current = point.x ** 2 + point.y ** 2 < DISH_RADIUS ** 2 ? point : null;
          placeDisc(point.x, point.y);
        }}
        style={{ transform: `scale(${cssScale})`, transformOrigin: "center center",
          width: CANVAS_SIZE, height: CANVAS_SIZE, flexShrink: 0 }}>
        <div aria-hidden="true"><Sketch setup={setup} draw={draw} /></div>
      </div>
      <span className="sr-only" role="status">{announcement}</span>
    </div>
  );
};

export default PetriDish;
