"use client";
import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Bacterium, AntibioticDisc } from "@/types";

// Dynamically import Sketch to avoid SSR issues with p5
const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

interface PetriDishProps {
  resetSignal: number;
  onStatsUpdate: (susceptible: number, resistant: number) => void;
  // Simulation Params
  mutationRate: number;
  reproductionChance: number;
  maxPopulation: number;
  discRadius: number;
  movementSpeed: number;
}

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
  
  // Refs for params to avoid closure staleness in p5 loop
  const paramsRef = useRef({
    mutationRate,
    reproductionChance,
    maxPopulation,
    discRadius,
    movementSpeed
  });

  // Keep refs updated
  useEffect(() => {
    paramsRef.current = {
      mutationRate,
      reproductionChance,
      maxPopulation,
      discRadius,
      movementSpeed
    };
  }, [mutationRate, reproductionChance, maxPopulation, discRadius, movementSpeed]);

  const initSimulation = (p5: any) => {
    discsRef.current = [];
    const population: Bacterium[] = [];
    for (let i = 0; i < 50; i++) {
      let pos;
      do {
        pos = p5.createVector(p5.random(-240, 240), p5.random(-240, 240));
      } while (pos.magSq() > 240 * 240); 

      population.push({
        pos: pos,
        vel: p5.createVector(0, 0),
        health: 100,
        isResistant: false,
        age: 0
      });
    }
    bacteriaRef.current = population;
  };

  // Reset when signal changes
  useEffect(() => {
    if (p5Ref.current) {
      initSimulation(p5Ref.current);
    }
  }, [resetSignal]);

  const setup = (p5: any, canvasParentRef: Element) => {
    p5.createCanvas(800, 600).parent(canvasParentRef);
    
    // Create static noise texture
    const gfx = p5.createGraphics(500, 500);
    gfx.translate(250, 250);
    gfx.background("#E6E6E6"); // --bg-agar
    gfx.noStroke();
    gfx.fill(0, 0, 0, 15); 
    
    for(let i = 0; i < 12000; i++) {
        const r = 250 * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        gfx.circle(x, y, 1.5);
    }
    agarTextureRef.current = gfx;

    p5Ref.current = p5;
    initSimulation(p5);
  };

  const mousePressed = (p5: any) => {
    const mx = p5.mouseX - p5.width / 2;
    const my = p5.mouseY - p5.height / 2;
    
    // Check if inside dish
    if (mx*mx + my*my < 62500) {
        discsRef.current.push({
            pos: p5.createVector(mx, my),
            radius: paramsRef.current.discRadius // Use dynamic radius
        });
    }
  };

  const draw = (p5: any) => {
    // Background
    p5.background("#F0F2F5");
    
    // Draw the dish
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);
    
    if (agarTextureRef.current) {
        p5.imageMode(p5.CENTER);
        p5.image(agarTextureRef.current, 0, 0);
    } else {
        p5.fill("#E6E6E6");
        p5.circle(0, 0, 500);
    }
    
    // Border
    p5.noFill();
    p5.stroke("#1A1A1A");
    p5.strokeWeight(4);
    p5.circle(0, 0, 500);
    
    // Draw Antibiotic Discs
    const discs = discsRef.current;
    for (let disc of discs) {
        p5.fill(255, 255, 255, 100);
        p5.stroke(255, 50, 50, 200); 
        p5.strokeWeight(2);
        p5.circle(disc.pos.x, disc.pos.y, disc.radius * 2);
    }

    // Update and Draw Bacteria
    const bacteria = bacteriaRef.current;
    const survivors: Bacterium[] = [];
    const newBacteria: Bacterium[] = [];
    
    // Access params from ref
    const { 
        mutationRate, 
        reproductionChance, 
        maxPopulation, 
        movementSpeed 
    } = paramsRef.current;

    for (let b of bacteria) {
      let isDead = false;

      // Kill Logic
      if (!b.isResistant) {
          for (let disc of discs) {
             const dx = b.pos.x - disc.pos.x;
             const dy = b.pos.y - disc.pos.y;
             if (dx*dx + dy*dy < disc.radius * disc.radius) {
                  b.health -= 5;
              }
          }
          if (b.health <= 0) isDead = true;
      }

      if (!isDead) {
          // Brownian motion (Scaled by movementSpeed)
          const vx = p5.random(-1, 1) * movementSpeed;
          const vy = p5.random(-1, 1) * movementSpeed;
          b.vel = p5.createVector(vx, vy);
          b.pos.add(b.vel);

          // Boundary check (Squared)
          if (b.pos.magSq() > 57600) { // 240^2
            b.pos.setMag(240);
          }
          
          b.age++;

          // Reproduction logic using dynamic params
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

          // Render
          if (b.isResistant) {
            p5.fill(255, 50, 50);
            p5.noStroke();
            p5.circle(b.pos.x, b.pos.y, 8);
          } else {
            p5.noFill();
            p5.stroke(0, 200, 100);
            p5.strokeWeight(2);
            p5.circle(b.pos.x, b.pos.y, 8);
          }
          
          survivors.push(b);
      }
    }

    // Update population
    bacteriaRef.current = [...survivors, ...newBacteria];

    // Report Stats
    if (p5.frameCount % 10 === 0) {
        const susceptible = bacteriaRef.current.filter(b => !b.isResistant).length;
        const resistant = bacteriaRef.current.length - susceptible;
        onStatsUpdate(susceptible, resistant);
    }
    
    p5.pop();
  };

  return <Sketch setup={setup} draw={draw} mousePressed={mousePressed} />;
};

export default PetriDish;
