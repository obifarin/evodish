"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Bacterium, AntibioticDisc } from "@/types";

// Dynamically import Sketch to avoid SSR issues with p5
const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

interface PetriDishProps {
  resetSignal: number;
  onStatsUpdate: (susceptible: number, resistant: number) => void;
  mutationRate: number;
  reproductionChance: number;
  maxPopulation: number;
  discRadius: number;
  movementSpeed: number;
}

// Fixed internal canvas size — simulation always runs at this resolution
const CANVAS_SIZE = 520;
const DISH_RADIUS = 240;

const PetriDish: React.FC<PetriDishProps> = ({
  resetSignal,
  onStatsUpdate,
  mutationRate,
  reproductionChance,
  maxPopulation,
  discRadius,
  movementSpeed
}) => {
  const p5Ref = useRef<any>(null);
  const bacteriaRef = useRef<Bacterium[]>([]);
  const discsRef = useRef<AntibioticDisc[]>([]);
  const agarTextureRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cssScale, setCssScale] = useState(1);

  const paramsRef = useRef({
    mutationRate,
    reproductionChance,
    maxPopulation,
    discRadius,
    movementSpeed
  });

  useEffect(() => {
    paramsRef.current = {
      mutationRate,
      reproductionChance,
      maxPopulation,
      discRadius,
      movementSpeed
    };
  }, [mutationRate, reproductionChance, maxPopulation, discRadius, movementSpeed]);

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
    // Also measure after a short delay for initial layout
    const timer = setTimeout(measure, 100);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(timer);
    };
  }, []);

  const initSimulation = useCallback((p5: any) => {
    discsRef.current = [];
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
        age: 0
      });
    }
    bacteriaRef.current = population;
  }, []);

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
    // Mouse coordinates are in the canvas element's coordinate space
    // Since we CSS-scale the canvas, we need to inverse-scale mouse coords
    const mx = (p5.mouseX / cssScale) - CANVAS_SIZE / 2;
    const my = (p5.mouseY / cssScale) - CANVAS_SIZE / 2;

    // Actually p5 handles canvas coords natively, so just offset from center
    const cx = p5.mouseX - CANVAS_SIZE / 2;
    const cy = p5.mouseY - CANVAS_SIZE / 2;

    if (cx * cx + cy * cy < DISH_RADIUS * DISH_RADIUS) {
      discsRef.current.push({
        pos: p5.createVector(cx, cy),
        radius: paramsRef.current.discRadius
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

    // Draw Antibiotic Discs
    const discs = discsRef.current;
    for (let disc of discs) {
      p5.fill(26, 26, 26, 30);
      p5.stroke("#1A1A1A");
      p5.strokeWeight(1);
      p5.drawingContext.setLineDash([5, 5]);
      p5.circle(disc.pos.x, disc.pos.y, disc.radius * 2);
      p5.drawingContext.setLineDash([]);
    }

    const bacteria = bacteriaRef.current;
    const survivors: Bacterium[] = [];
    const newBacteria: Bacterium[] = [];

    const { mutationRate, reproductionChance, maxPopulation, movementSpeed } = paramsRef.current;

    for (let b of bacteria) {
      let isDead = false;

      if (!b.isResistant) {
        for (let disc of discs) {
          const dx = b.pos.x - disc.pos.x;
          const dy = b.pos.y - disc.pos.y;
          if (dx * dx + dy * dy < disc.radius * disc.radius) {
            b.health -= 5;
          }
        }
        if (b.health <= 0) isDead = true;
      }

      if (!isDead) {
        const vx = p5.random(-1, 1) * movementSpeed;
        const vy = p5.random(-1, 1) * movementSpeed;
        b.vel = p5.createVector(vx, vy);
        b.pos.add(b.vel);

        const boundaryRadius = DISH_RADIUS - 10;
        if (b.pos.magSq() > boundaryRadius * boundaryRadius) {
          b.pos.setMag(boundaryRadius);
        }

        b.age++;

        if (bacteria.length + newBacteria.length < maxPopulation && p5.random(1) < reproductionChance) {
          let offspringResistant = b.isResistant;
          if (!b.isResistant && p5.random(1) < mutationRate) {
            offspringResistant = true;
          }
          newBacteria.push({
            pos: b.pos.copy(),
            vel: p5.createVector(0, 0),
            health: 100,
            isResistant: offspringResistant,
            age: 0
          });
        }

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

        survivors.push(b);
      }
    }

    bacteriaRef.current = [...survivors, ...newBacteria];

    if (p5.frameCount % 10 === 0) {
      const susceptible = bacteriaRef.current.filter(b => !b.isResistant).length;
      const resistant = bacteriaRef.current.length - susceptible;
      onStatsUpdate(susceptible, resistant);
    }

    p5.pop();
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div style={{
        transform: `scale(${cssScale})`,
        transformOrigin: 'center center',
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