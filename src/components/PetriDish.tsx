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
}

const PetriDish: React.FC<PetriDishProps> = ({ resetSignal, onStatsUpdate }) => {
  const p5Ref = useRef<any>(null);
  const bacteriaRef = useRef<Bacterium[]>([]);
  const discsRef = useRef<AntibioticDisc[]>([]);

  const initSimulation = (p5: any) => {
    discsRef.current = [];
    const population: Bacterium[] = [];
    for (let i = 0; i < 50; i++) {
      // Random position inside circle (radius 250)
      let pos;
      do {
        pos = p5.createVector(p5.random(-240, 240), p5.random(-240, 240));
      } while (pos.mag() > 240); 

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
    p5Ref.current = p5;
    initSimulation(p5);
  };

  const mousePressed = (p5: any) => {
    const mx = p5.mouseX - p5.width / 2;
    const my = p5.mouseY - p5.height / 2;
    
    // Check if inside dish
    if (p5.dist(0, 0, mx, my) < 250) {
        discsRef.current.push({
            pos: p5.createVector(mx, my),
            radius: 60
        });
    }
  };

  const draw = (p5: any) => {
    // Background
    p5.background("#F0F2F5"); // --bg-lab
    
    // Draw the dish
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);
    
    // Dish body
    p5.fill("#E6E6E6"); // --bg-agar
    p5.stroke("#1A1A1A"); // --ink-primary
    p5.strokeWeight(4); // --border-thick
    p5.circle(0, 0, 500); // 500px diameter
    
    // Draw Antibiotic Discs
    const discs = discsRef.current;
    for (let disc of discs) {
        p5.fill(255, 255, 255, 100);
        p5.stroke(255, 50, 50, 200); // Reddish outline
        p5.strokeWeight(2);
        p5.circle(disc.pos.x, disc.pos.y, disc.radius * 2);
    }

    // Update and Draw Bacteria
    const bacteria = bacteriaRef.current;
    const survivors: Bacterium[] = [];
    const newBacteria: Bacterium[] = [];
    const MAX_POPULATION = 400;
    const MUTATION_RATE = 0.05;
    
    for (let b of bacteria) {
      let isDead = false;

      // Kill Logic
      if (!b.isResistant) {
          for (let disc of discs) {
              if (b.pos.dist(disc.pos) < disc.radius) {
                  b.health -= 5;
              }
          }
          if (b.health <= 0) isDead = true;
      }

      if (!isDead) {
          // Brownian motion
          b.vel = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
          b.pos.add(b.vel);

          // Boundary check
          const distFromCenter = b.pos.mag();
          if (distFromCenter > 240) {
            b.pos.setMag(240);
          }
          
          b.age++;

          // Reproduction
          if (bacteria.length + newBacteria.length < MAX_POPULATION && p5.random(1) < 0.005) {
             let offspringResistant = b.isResistant; 
             if (!b.isResistant && p5.random(1) < MUTATION_RATE) {
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
            p5.fill(255, 50, 50); // Red
            p5.noStroke();
          } else {
            p5.noFill();
            p5.stroke(0, 200, 100); // Green stroke
            p5.strokeWeight(2);
          }
          
          p5.circle(b.pos.x, b.pos.y, 8);
          
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
