# 🧫 EvoDish — Antibiotic Resistance Simulator

EvoDish is an interactive teaching simulation of bacterial evolution. Place antibiotic discs in a digital petri dish and watch how mutation, selection, and gene transfer change the balance between susceptible and resistant cells.

The dish has a dimensional appearance built with Canvas 2D lighting and capsule sprites. The underlying model is two-dimensional and deliberately simplified for exploration and teaching; it is not a predictive laboratory or clinical tool.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![p5.js](https://img.shields.io/badge/p5.js-simulation-ed225d)

**Brought to you by [Titerly](https://www.titerly.com/) · Created by [Olatomiwa Bifarin](https://www.bifarin.me/).**

## What you can explore

Each run starts with 50 susceptible cells at random positions inside the dish. Cells move, age, and divide. Susceptible parents may produce resistant offspring when they divide; resistant parents produce resistant offspring.

- **Basic mode:** explore mutation and selection. Susceptible cells lose health inside antibiotic zones, while resistant cells are protected.
- **Advanced mode:** enable proximity-based gene transfer, a growth cost for resistance, and a stress halo outside each antibiotic zone that multiplies susceptible mutation probability by 10.
- **Experiment controls:** adjust population and environmental parameters, pause or reset the culture, and use auto-stop to freeze a run at a chosen simulation frame.
- **Observations:** follow susceptible and resistant counts, resistance percentage, recent population history, and the latest transfer frame.

Select **Methods** in the app for the current parameter values, update rules, visual guide, and model limitations.

## Run locally

### Requirements

- Node.js **20.9.0 or newer**, as required by the installed Next.js 16 release
- npm

```bash
git clone https://github.com/obifarin/evodish.git
cd evodish
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No API keys, database, or environment variables are required for the simulation. The app uses Google fonts through `next/font/google`, so development and production builds need access to download those fonts.

For a local production build:

```bash
npm run build
npm start
```

The default development command uses Next.js's default bundler. To run the development server with Webpack instead:

```bash
npm run dev -- --webpack
```

### Code checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

There is currently no automated test script in `package.json`. Browser checks and simulation/renderer verification performed during development are recorded in [the verification notes](docs/visual-upgrade-verification.md).

## Using the simulation

| Action | Control |
| --- | --- |
| Place an antibiotic disc | Click or tap inside the dish |
| Place a disc with the keyboard | Focus the dish, aim with arrow keys, then press Enter or Space; Shift + arrows moves farther, and Escape hides the target |
| Change mutation probability | **MUTATION**, from 0–20%, applied when susceptible cells divide |
| Change growth probability | **GROWTH RATE**, from 0–5%, applied each tick after the division cooldown |
| Change lifespan | **LIFESPAN**, from 100–2,000 simulation frames |
| Set the population cap | **CAPACITY**, from 100–3,000 cells; lowering the cap limits new births rather than removing existing cells |
| Change antibiotic zone radius | **DRUG STR.**, from 20–100 model units; applies to newly placed discs |
| Change movement | **MOTION**, from 0.1–4×; changes cell movement, not simulation time |
| Enable advanced mechanisms | Choose **Advanced** beside the dish |
| Change transfer probability | **CONJUGATION**, from 0–3%, in Advanced mode |
| Change the growth cost of resistance | **FITNESS COST**, from 1–3×, in Advanced mode |
| Pause or resume | Use the labeled button beneath the dish |
| Reset | Use the reset button beneath the dish to clear discs and history and start again with 50 susceptible cells; parameter settings are retained |
| Stop at a chosen frame | Turn **Auto-stop** on and adjust **LIMIT**, from 1,000–10,000 frames |
| Read the visual guide | Hover over, focus, or tap **Reading the dish**; press Escape or click outside to dismiss |

## Reading the dish

- **Green capsules:** susceptible cells.
- **Banded rust capsules:** resistant cells. The bands provide a cue beyond color; they do not distinguish mutation from transfer.
- **Paper discs marked AB:** antibiotic placement. Dashed boundaries show the lethal zones.
- **Dotted outer boundaries:** the stress halos, shown in Advanced mode.
- **Violet filaments:** recent gene transfers between living cell pairs in Advanced mode. They last about 1.5 seconds of simulation time, with up to 200 recent filaments displayed. There are no recipient rings.

The observations panel shows the latest transfer frame; cumulative HGT totals are not displayed. The chart retains the latest 200 population samples, rather than the entire run. Counts are sampled every 10 simulation ticks and at auto-stop.

On laptop layouts wider than 1,100 pixels, the dish adapts to the available screen height, up to a 640-pixel display size. Counts and transfer information sit beside it, while playback and the cell legend remain beneath it. Narrow screens use a scrolling layout. Reduced-motion preferences suppress decorative transitions and hold transfer highlights steady without changing the simulation rules.

The website uses the 🧫 emoji as its favicon. The footer includes the linked Titerly and creator attribution with locally stored site favicons.

## Model rules and limitations

Simulation time targets 60 ticks per second independently of rendering. Paused or hidden tabs do not advance the culture. Short rendering stalls allow bounded catch-up; long stalls do not fast-forward the run. Probabilities and cooldowns are defined per simulation tick, not per real-world biological generation.

### Mutation and inheritance

Division requires a cooldown of more than 100 ticks since the cell's last division. A susceptible parent's offspring can become resistant according to the mutation setting. Mutation probabilities are intentionally exaggerated for visibility. Resistance is represented as a single inherited boolean state, without individual genes or molecular mechanisms.

### Antibiotic selection

Susceptible cells lose health inside fixed circular antibiotic zones. Resistant cells are fully protected in this model. The drug control changes the radius of newly placed zones; it does not model concentration, diffusion, antibiotic decay, or MIC. Cell movement is random mixing, and age-based death and the population cap are simplified turnover and crowding rules.

### Advanced mechanisms

Conjugation is checked every three ticks. A resistant donor can convert a susceptible neighbor less than eight model units away, according to the conjugation probability. This is a proximity-and-chance abstraction; the model does not simulate plasmid compatibility, pilus mechanics, species barriers, or multiple resistance genes.

The fitness-cost multiplier divides resistant cells' reproduction probability. The stress halo extends 20 model units beyond the lethal boundary and multiplies susceptible mutation probability during division by 10. These mechanisms are teaching abstractions, not calibrated predictions of bacterial growth or stress responses.

## Technology and project structure

The app uses Next.js 16.3.4 with the App Router, React 19.2.8, strict TypeScript, p5.js through `react-p5`, Tailwind CSS 4, and Lucide icons. Fraunces and Space Mono provide typography. Vercel Analytics is included in the root layout; the simulation itself runs in the browser.

```text
evodish/
├── src/
│   ├── app/
│   │   ├── globals.css              # Responsive layout and visual styles
│   │   ├── icon.svg                 # Petri-dish emoji favicon
│   │   ├── layout.tsx               # Fonts, metadata, and analytics
│   │   └── page.tsx                 # Main interface and shared UI state
│   ├── components/
│   │   ├── ControlDeck.tsx          # Parameter sliders and auto-stop controls
│   │   ├── DishGuide.tsx            # Hover, focus, and tap visual guide
│   │   ├── MethodsPanel.tsx         # Current setup and model documentation
│   │   ├── PetriDish.tsx            # Simulation ticks, canvas, and interaction
│   │   └── PopulationChart.tsx      # Rolling population history
│   ├── content/
│   │   └── simulationContent.ts     # Control definitions and explanations
│   ├── lib/
│   │   └── dishRenderer.ts          # Cached dish surfaces and cell sprites
│   └── types.ts                    # Shared TypeScript types
├── public/attribution/             # Favicons from the linked attribution sites
├── docs/visual-upgrade-verification.md
├── package.json
├── package-lock.json
└── README.md
```

## Possible future work

These ideas are not implemented:

- Natural-language scenario configuration
- Exportable simulation data (CSV/JSON)
- Multiple resistance genes and antibiotics
- Nutrient or resource competition
- Simulation time acceleration

## License

EvoDish's original code and documentation are available under the [MIT License](LICENSE).
Copyright © 2026 Olatomiwa Bifarin.

Third-party dependencies and assets retain their own licenses. In particular,
p5.js is licensed under LGPL-2.1; EvoDish's MIT license does not replace those terms.
