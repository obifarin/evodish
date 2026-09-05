# Specimen rendering upgrade — verification

Verified locally on September 4, 2026.

## Approach

Retain p5/Canvas 2D with a fixed overhead view. `src/lib/dishRenderer.ts` caches the
static glass/agar surface and 32 oriented cell sprites. No new dependencies.
Decorative orientation and grain never consume simulation randomness. Death sprites
are capped at 200; cell orientation metadata uses a WeakMap.

The 520-unit coordinate system and 240-unit agar radius are unchanged. Pointer
coordinates map through the displayed element bounds; keyboard placement uses the
same logical coordinates. Shadows and highlights do not move cells or exposure zones.

Ticks target 60 Hz separately from rendering. Catch-up is capped at 100 ms per draw;
stalls above 250 ms are discarded rather than fast-forwarded. Auto-stop synchronously
stops tick processing, including within a catch-up batch. Reduced motion suppresses
birth scaling, death fades, and CSS animation; biological movement remains active.

## Checks

- TypeScript, ESLint, whitespace checks, and optimized Next.js build passed.
- Original and upgraded biological loops compared with identical seeded inputs for
  1,600 ticks in each of basic and advanced modes. Complete cell state, random
  outcomes, HGT totals, frame counter, and sampled statistics matched every tick.
  Inputs included 150 starting cells with resistance, two antibiotic discs, mutation,
  reproduction, aging, and a capacity of 3,000. Exact auto-stop at tick 127 also passed.
- Live browser: keyboard and pointer disc placement; pause/resume; reset while paused
  (50 susceptible, zero resistant, zero frame/HGT); advanced mode and HGT; controls;
  methods panel; live population reaching 3,000; auto-stop exactly at tick 1,000. No browser errors detected.
- Responsive measurements: 320 px, 390 px, and 768 px viewports had no horizontal
  overflow. The dish measured 288 px, 358 px, and 486 px respectively. Desktop visual
  inspection at 1280 px also completed. Viewport override restored after testing.

## Renderer benchmark

A temporary browser harness rendered 3,000 cells, 12 discs, and 200 simultaneous
transfer filaments at pixel density 2. After 31 warm-up frames, 299 draws measured:

| Measure | Result |
| --- | ---: |
| Mean render CPU duration | 1.83 ms |
| 95th percentile render CPU duration | 2.10 ms |
| Median animation-frame interval | 16.70 ms |
| 95th percentile animation-frame interval | 17.60 ms |

These measurements cover rendering in the local browser, not end-to-end simulation
CPU time or low-end phone hardware. The temporary public benchmark files were removed.
Reduced-motion behavior was reviewed in code; an OS-level preference change and
physical touchscreen testing were not performed.

## Transfer visibility and interface follow-up

- Replaced the hidden advanced-mode switch with a Basic / Advanced selector beside
  the specimen. Mode status, legend, playback, population summary, and the latest
  actual transfer frame are grouped with the dish. Sliders use semantic fieldsets.
- Transfer markers now use 90 ticks (about 1.5 seconds): a violet filament with a pale
  contrast outline and a recipient ring. Markers follow their cells and disappear
  when recipients die. At most 200 markers are drawn; every biological event still
  contributes to HGT totals. Reduced motion holds the highlight steady.
- Verified live violet recipient rings with 99 cumulative transfers and the last
  transfer at frame 4,719, paused at frame 4,720. The count and event timestamp come
  directly from actual conversions, never decorative animations.
- Re-ran the seeded 1,600-tick comparison in both modes: complete biological state
  matched the original at every tick. Exact auto-stop at tick 127 also passed.
- TypeScript, ESLint, optimized production build, and whitespace checks passed.
- 609 × 727: mode selector, playback, legend, population summary, and transfer text
  visible together. 390 × 844 and 320 × 740 were checked as well; no horizontal
  overflow after the responsive canvas resize completed.
- Repeated renderer benchmark with 3,000 cells, 12 discs, and 200 full-strength
  transfer markers at density 2: 1.76 ms mean, 1.90 ms p95 CPU draw duration;
  animation-frame interval median 16.7 ms, p95 17.6 ms. This is a local rendering
  measurement, not a guarantee of whole-app performance on other devices.

## Quieter transfer cue and larger specimen

Removed recipient rings. Transfers now use a thin muted-violet filament (1.2 logical
pixels, 65% opacity with a final fade). Expanded the display cap to 640 px and allowed
responsive upscaling of the unchanged 520-unit simulation. Verified a 640 px canvas
in-browser with no horizontal overflow, live HGT events, and no console errors.
TypeScript, ESLint, and whitespace checks passed. The larger specimen allows vertical
page scrolling instead of imposing a viewport-height size limit.

## Laptop fit and clearer filaments

Increased filament width to 1.8 logical pixels and opacity to 85%, retaining the
final fade and omitting recipient rings. Desktop layouts now fit the viewport
height, with population counts and transfer information beside the dish. The dish
keeps its 640 px maximum and scales down only to the available width or height.

Browser checks with Advanced mode and auto-stop enabled:
- 1280 × 720: 500 px canvas; no page or panel scrolling, including the longest
  focused control description.
- 1440 × 800: 580 px canvas; complete dish, playback, controls, and observations
  visible without scrolling.
- 1512 × 900: full 640 px canvas; no page overflow.
- 390 × 844: responsive stacked layout, one visible population summary, and no
  horizontal overflow. Narrow screens retain normal vertical scrolling.

ESLint, TypeScript, the optimized production build, and whitespace checks passed.

## Compact guide and attribution

Removed the displayed HGT total and replaced the standing visual explanation with
Reading the dish. The guide opens on hover, focus, or click/tap and dismisses on
Escape, outside interaction, blur, or viewport changes. Basic mode explains that
transfer and the stress halo are disabled; Advanced mode explains all three cues.
Methods now describes the current population summary, guide, mode selector, and
transfer filament duration and limit. The footer uses the requested Titerly/creator
attribution with locally stored favicons from both linked websites.

Verified click and keyboard opening, Escape dismissal, both mode descriptions,
and updated Methods content in-browser. At 1280 × 720 there is no page overflow;
at 390 × 844 the open guide remains inside the viewport with no horizontal
overflow. Both favicon images loaded successfully. Production build, TypeScript,
ESLint, and whitespace checks passed.

## Dependency security update — 2026-09-05

- Upgraded Next.js and eslint-config-next from 16.1.6 to 16.3.4, and React/React DOM
  from 19.2.3 to 19.2.8. Refreshed compatible React type definitions.
- Applied compatible transitive dependency fixes without force or overrides.
  The resulting tree includes PostCSS 8.5.23, Sharp 0.35.4, and Nanoid 3.3.18.
- A full npm audit, including development dependencies, initially reported 13
  vulnerable package entries. After the updates and a clean `npm ci`, it reported
  zero vulnerabilities. This records the advisory database at verification time;
  it is not a guarantee against future findings.
- Production build and TypeScript checks passed after clearing stale generated
  `.next` types from the prior Next.js version. ESLint and whitespace checks passed.
- Browser verification with the default Turbopack dev server confirmed live cell
  growth, pause (frame held at 2,220), reset to 50 susceptible cells, Advanced mode,
  slider updates, keyboard antibiotic placement, the visual guide, and Methods.
- An accelerated-growth test with auto-stop set to 1,000 completed at exactly that
  frame, with 9 susceptible and 1,991 resistant cells and a real transfer reported
  at frame 966. These counts describe one stochastic run, not an expected result.
- At 1280 × 720, the full layout remained visible without page overflow. The canvas,
  chart, attribution favicons, and antibiotic boundaries rendered, and browser
  error/warning logs were empty.
- Next.js generated AGENTS.md and CLAUDE.md pointing to its bundled documentation.
  No simulation or UI source changes were required for the upgrade.
- npm still marks react-p5 1.4.1 as deprecated. It passed these runtime checks and
  has no current npm audit finding; replacing that wrapper is a separate
  maintenance task.

## Dead-code cleanup — 2026-09-05

- Removed the unreferenced StatsPanel component, five unused Next.js starter SVGs,
  an unused React import, six unused CSS variables, and permanently hidden header
  badges. The visible Methods badges remain in use.
- Removed the obsolete cumulative HGT counter and its callback adapter. Transfer
  notifications now carry only the latest event frame, or null on reset.
- Removed stored transfer endpoint coordinates and unreachable fallback paths;
  every transfer marker already carries both living-cell references.
- Removed unused direct p5 and @types/p5 dependencies. The actual renderer still
  uses react-p5's p5 1.7.0 runtime and matching types. npm removed 16 packages and
  reported zero vulnerabilities.
- Source import traversal found no remaining unreferenced TypeScript modules.
  ESLint, TypeScript with noUnusedLocals/noUnusedParameters, the production build,
  and whitespace checks passed.
- Browser checks confirmed fresh canvas loading, live growth, Advanced controls,
  keyboard antibiotic placement, Methods, and the visual guide. Auto-stop reached
  frame 1,000 with the latest transfer at frame 975; reset then restored 50
  susceptible cells and cleared the transfer readout. This describes one random
  test run, not a fixed expected population result.
- Layout checks passed at 1280 × 720 and 1440 × 800 without page overflow. At
  320 × 740, the header/GitHub link, dish, and open guide fit horizontally. Footer
  images loaded and browser error/warning logs were empty. Default settings and
  viewport were restored after verification.
