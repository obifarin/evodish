# 🧫 EvoDish — Antibiotic Resistance Simulator

An interactive, real-time simulation of bacterial evolution and antibiotic resistance. Drop antibiotics onto a digital petri dish and watch natural selection unfold — susceptible bacteria die while resistant mutants survive and multiply.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![p5.js](https://img.shields.io/badge/p5.js-simulation-ed225d)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What It Does

EvoDish simulates a bacterial population in a petri dish where you control evolutionary pressure in real time:

1. **Bacteria reproduce** via asexual division with a configurable growth rate
2. **Mutations occur** randomly during division — susceptible cells can spawn resistant offspring
3. **You drop antibiotic discs** onto the dish — susceptible bacteria inside the kill zone die; resistant bacteria survive
4. **Natural selection plays out** — resistant colonies expand to fill the niche left by dead susceptible cells

### Advanced Mode ("It's More Complicated")

Toggle advanced mode to unlock more biologically realistic mechanics:

- **Horizontal Gene Transfer (Conjugation):** Resistant bacteria can pass resistance genes to nearby susceptible cells via pilus — visualized as bright magenta connection lines
- **Fitness Cost:** Resistance comes at a metabolic cost — resistant bacteria reproduce slower than wild type
- **Gradient Kill Zones:** Antibiotic discs have a lethal inner core and a sub-lethal stress halo that accelerates mutation rate by 10×

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/obifarin/evodish.git
cd evodish
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use

| Action | How |
|---|---|
| **Place antibiotic** | Click anywhere inside the petri dish |
| **Adjust mutation rate** | Drag the MUTATION slider (0–20%) |
| **Change growth rate** | Drag the GROWTH RATE slider |
| **Set population limit** | Drag the CAPACITY slider (100–3000) |
| **Adjust drug strength** | Drag the DRUG STR. slider (kill zone radius) |
| **Change bacterial speed** | Drag the MOTION slider |
| **Toggle advanced mode** | Click the "IT'S MORE COMPLICATED" switch |
| **Pause / Resume** | Click the ⏸ / ▶ button below the dish |
| **Reset simulation** | Click the ⟲ button below the dish |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript (strict) |
| Simulation | [p5.js](https://p5js.org/) via `react-p5` |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Typography | Fraunces (serif display) + Space Mono (data/UI) |
| Icons | [Lucide React](https://lucide.dev/) |

---

## Project Structure

```
evodish/
├── src/
│   ├── app/
│   │   ├── globals.css         # Design tokens & custom utilities
│   │   ├── layout.tsx          # Font loading, metadata
│   │   └── page.tsx            # Main page — state management & layout
│   ├── components/
│   │   ├── PetriDish.tsx       # p5.js simulation canvas & all evolution logic
│   │   ├── ControlDeck.tsx     # Parameter sliders & advanced mode toggle
│   │   ├── StatsPanel.tsx      # Susceptible / Resistant population counters
│   │   └── PopulationChart.tsx # SVG line chart of population over time
│   └── types.ts                # Shared TypeScript interfaces
├── .gemini/                    # Agent instructions & design docs (gitignored)
├── package.json
└── README.md
```

---

## The Science

This simulator models three core mechanisms of antibiotic resistance evolution:

### 1. Mutation (Vertical Gene Transfer)
During cell division, a random mutation can confer antibiotic resistance. This is controlled by the **Mutation Rate** parameter. In the real world, mutation rates for clinically relevant resistance are typically 10⁻⁶ to 10⁻⁹ per base pair per generation — we amplify this for visual clarity.

### 2. Selection Pressure
Antibiotics create a selective environment. Susceptible bacteria die in the kill zone, opening ecological niches for resistant mutants to expand. The **Drug Strength** parameter controls the size of this kill zone — analogous to antibiotic concentration (MIC).

### 3. Conjugation (Horizontal Gene Transfer)
In advanced mode, resistant bacteria can transfer plasmid-encoded resistance genes to nearby susceptible cells through direct contact (pilus formation). This mechanism is responsible for the rapid spread of multi-drug resistance in clinical settings.

### Fitness Cost
Resistance mechanisms (e.g., efflux pumps, altered ribosomes) are metabolically expensive. In advanced mode, resistant bacteria reproduce slower — controlled by the **Fitness Cost** multiplier. Without antibiotic pressure, susceptible bacteria outcompete resistant ones.

---

## Roadmap

- [ ] 🤖 **Agent Mode ("Scenario Architect")** — Describe a real-world scenario in natural language and an AI agent configures and drives the simulation
- [ ] 📊 Exportable simulation data (CSV/JSON)
- [ ] 🧬 Multiple resistance genes / multi-drug resistance
- [ ] 🔬 Resource competition (nutrient gradient)
- [ ] ⏱️ Simulation speed control / time acceleration

---

## Author

Made by [Olatomiwa Bifarin](https://bifarin.me)

---

## License

MIT
