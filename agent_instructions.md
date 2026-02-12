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
2.  **Reproduction:** Asexual division based on a timer.
3.  **Mutation:** A small probability (e.g., 1%) during division that a "Susceptible" bacterium spawns a "Resistant" offspring.
4.  **Selection Pressure:** The user can drop "Antibiotic Discs" onto the canvas.
    - **Susceptible bacteria** inside the disc's radius die rapidly.
    - **Resistant bacteria** are immune to the disc's effect.

---

## Implementation Phases

### Phase 1: The "Sterile Lab" (Setup & Boilerplate)
**Goal:** Initialize the Next.js project and render a blank Petri dish canvas.
1.  Initialize a standard Next.js App Router project.
2.  Install `react-p5`.
3.  Create a component `PetriDish.tsx`.
4.  **Visuals:**
    - Draw a large, light-gray circle in the center of the canvas to represent the agar plate.
    - Add a "Reset Dish" button in the UI overlay.

### Phase 2: Life (The Bacterial Agent System)
**Goal:** Populate the dish with moving, living "Wild Type" bacteria.
1.  Create a TypeScript interface `Bacterium`:
    ```typescript
    interface Bacterium {
      pos: P5.Vector;
      vel: P5.Vector; // Random walk movement
      health: number; // 0-100
      isResistant: boolean; // false for now
      age: number;
    }
    ```
2.  **Simulation Loop (in p5 `draw` function):**
    - Initialize an array of 50 `Bacterium` objects.
    - **Movement:** Apply slight Brownian motion (random wiggling) to each agent. Constrain them to stay *inside* the petri dish circle.
    - **Rendering:** Draw small green circles (r=4px) for susceptible bacteria.

### Phase 3: Evolution (Reproduction & Mutation Logic)
**Goal:** Implement the biological drivers of population growth and genetic variation.
1.  **Reproduction:**
    - Add a global constant `MAX_POPULATION` (e.g., 400) to prevent performance crashes.
    - Every 100-200 frames, if `population < MAX_POPULATION`, a bacterium should "divide."
    - Division creates a new bacterium at the same location.
2.  **Mutation:**
    - During division, use `Math.random()` to determine mutation.
    - Set `MUTATION_RATE = 0.05` (5% chance).
    - If mutation occurs, the new bacterium has `isResistant = true`.
    - **Visual Differentiation:** Render Resistant bacteria as **RED** circles (or a distinct color/shape) so they stand out against the green Wild Type.

### Phase 4: The Challenge (Antibiotic Discs)
**Goal:** Allow user interaction to introduce selective pressure.
1.  **Interaction:** On mouse click, spawn an `AntibioticDisc` object at the cursor location.
2.  **Disc Properties:** `position`, `radius` (zone of inhibition).
3.  **Kill Logic (The Critical Step):**
    - In every frame, calculate the distance between every bacterium and every disc.
    - IF `distance < disc.radius` AND `bacterium.isResistant === false`:
        - `bacterium.health -= 5;`
    - IF `bacterium.health <= 0`:
        - Remove from array (death).
4.  **Visuals:** Draw the discs as semi-transparent white circles with a red outline to indicate the "danger zone" for non-resistant strains.

### Phase 5: Data Visualization (The Scientist's Dashboard)
**Goal:** Display real-time stats to prove the concept.
1.  Create a `StatsPanel.tsx` component overlaying the canvas.
2.  Display real-time counters:
    - **Susceptible Population** (Green text)
    - **Resistant Population** (Red text)
    - **Total Population**
3.  Observe the "Takeover": Users should see the Green number plummet when a disc is dropped, followed by the Red number rising as the resistant strain fills the empty space.
