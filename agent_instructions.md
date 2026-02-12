# Project: The EvoDish (Antibiotic Resistance Simulator)

## Role & Objective
You are a Senior Creative Technologist and Frontend Engineer. Your goal is to build an interactive, scientifically grounded simulation of bacterial evolution and antibiotic resistance using a "digital petri dish" metaphor.

The application must be performant, visually engaging, and code-structurally clean.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS
- **Simulation Engine:** p5.js (via `react-p5` wrapper)
- **State Management:** React Hooks (useState, useEffect, useRef)
- **Icons:** Lucide-React

## Core Scientific Concepts (The "Game Rules")
1.  **The Agents (Bacteria):** Individual particles with properties: `position`, `health`, `age`, `isResistant` (boolean).
2.  **Reproduction:** Asexual division based on a timer (approx. every 200 frames).
3.  **Mutation:** A variable probability (controlled via UI) during division that a "Susceptible" bacterium spawns a "Resistant" offspring.
4.  **Selection Pressure:** The user can drop "Antibiotic Discs" onto the canvas.
    - **Susceptible bacteria** inside the disc's radius die rapidly.
    - **Resistant bacteria** are immune to the disc's effect.

---

## Completed Implementation Details

### 1. The "Petri Dish" (Canvas & Visuals)
- **Component:** `PetriDish.tsx`
- **Visuals:** 
    - A large, circular agar plate with a generated **static noise texture** for organic feel (using `p5.Graphics`).
    - Surrounded by a thick "lab-grade" border.
    - Rendered using `react-p5` with `next/dynamic` import to handle SSR.

### 2. The Bacterial Agent System
- **Interface:** `Bacterium` (`pos`, `vel`, `health`, `isResistant`, `age`).
- **Population Limit:** `MAX_POPULATION` set to **1000**.
- **Movement:** Brownian motion (random walk). Constrained inside the dish radius using squared distance checks (`magSq()`) for performance.
- **Rendering:**
    - **Susceptible:** Green stroke, hollow circles.
    - **Resistant:** Red fill, solid circles.

### 3. Evolution Logic
- **Reproduction:** Occurs randomly (~0.5% chance per frame) if population is under limit.
- **Mutation:** 
    - Controlled dynamically via a prop `mutationRate` (default 0.05).
    - If a non-resistant bacterium divides, it has a `mutationRate` chance to spawn a resistant offspring.
    - Resistant bacteria always spawn resistant offspring.

### 4. Antibiotic Discs (Interaction)
- **Action:** Clicking on the dish spawns an `AntibioticDisc`.
- **Properties:** Position is mouse coordinates; radius is fixed (60px).
- **Kill Logic:**
    - Checks distance between every susceptible bacterium and every disc.
    - Uses squared distance optimization.
    - If inside radius, health decreases rapidly.
    - Bacteria removed from array upon death.

### 5. UI & Controls
- **StatsPanel:** `StatsPanel.tsx` displays real-time "Susceptible" vs "Resistant" population counts.
    - Updated every 10 frames via `onStatsUpdate` callback to reduce React render thrashing.
- **ControlDeck:** `ControlDeck.tsx` provides:
    - **Reset Sample:** Clears and re-seeds the simulation.
    - **Mutation Rate:** Slider input (0% - 20%) to adjust evolutionary pressure in real-time.

---

## Future Roadmap (Potential Extensions)
1.  **Aging:** Bacteria die naturally after a certain age.
2.  **Resource Competition:** Bacteria need food (dots) to survive/reproduce.
3.  **Graphs:** Line chart showing population history over time.