# Project: EvoDish - Design System & UI Overhaul

## Objective
Update the existing "EvoDish" application to match a specific "Bio-Containment Interface" aesthetic. The vibe should be "Clinical, High-Stakes, Industrial Science." Think: The interface of a fancy microscope in a Level 4 Biosafety Lab.

Use the provided `react-app.js` as a reference for the *quality* of the styling (custom shaders, typography, layout), but adapt the *theme* from "Mars Colonization" to "Bacterial Evolution."

## 1. Design Tokens (CSS Variables)
Replace the current color palette with this "Containment" theme.

```css
:root {
  /* Backgrounds */
  --bg-lab: #F0F2F5;       /* Clinical White/Grey */
  --bg-agar: #E6E6E6;      /* The dish background */
  
  /* Accents */
  --bio-hazard: #FFD700;   /* Warning Yellow */
  --alert-red: #FF4D4D;    /* Resistance/Danger */
  --safe-green: #00CC66;   /* Susceptible/Life */
  --sterile-blue: #4D96FF; /* Antibiotic/Medical */
  
  /* Text & UI */
  --ink-primary: #1A1A1A;  /* Deep Black */
  --ink-secondary: #595959;
  
  /* Structure */
  --border-thick: 2px solid var(--ink-primary);
  --border-thin: 1px solid var(--ink-secondary);
  --radius-sm: 4px;
  --radius-lg: 24px; /* Pill shapes */
  
  /* Spacing */
  --pad-xs: 8px;
  --pad-md: 24px;
  --pad-xl: 64px;
}

```

## 2. Typography

Use the same font pairing strategy as the reference file but for a lab context.

* **Headings (Display):** `Syne`, sans-serif (Bold, 800). Used for big counters and the main title.
* **Data/UI (Technical):** `Space Mono`, monospace. Used for all labels, buttons, and live stats.

## 3. Component Styling Instructions

### A. The "Petri Dish" (Main Canvas)

* **Visual Container:** The p5.js canvas should be centered.
* **The Dish:** Draw the circular boundary of the dish using a thick, dark stroke (`#1A1A1A`, 4px weight) to make it feel like a physical vessel.
* **Shader/Texture (Optional but Cool):** If possible, add a subtle grain or "noise" overlay to the agar background (like the `ThreeCanvas` in the reference) so it doesn't look like flat grey plastic.

### B. The "Heads-Up Display" (UI Overlay)

Do not use standard HTML buttons. Make them look like a digital dashboard overlaying the microscope view.

**1. Header (The Lab Notebook)**

* **Top Left:** "PROJECT: EVODISH // SEQ-001" (Space Mono, small caps).
* **Top Right:** A live clock or "T-Minus" timer representing simulation steps.

**2. The Control Deck (Bottom Center)**

* Create a floating control bar at the bottom of the screen.
* **Button Styles:**
* **"Drop Antibiotic":** A pill-shaped button with a dashed border. `border: 1px dashed var(--ink-primary)`. Hover effect: Fills with `--sterile-blue`.
* **"Reset Sample":** A simple text link with an underline. `text-decoration: underline`.
* **"Mutation Rate":** A slider input styled as a "track" line.



**3. The Stats Panel (Data Visualization)**

* Instead of a boring list, place large numbers in the corners of the screen (similar to the "Atmosphere/Gravity" text in the Mars reference).
* **Left Side:**
* `SUSCEPTIBLE COLONY`
* **[BIG GREEN NUMBER]**


* **Right Side:**
* `RESISTANT STRAIN`
* **[BIG RED NUMBER]**
* *Add a "blink" animation to the red number if it increases rapidly.*



## 4. Animation & Interactivity

* **Cursor:** Change the cursor to a "Crosshair" or a custom "Pipette" icon when hovering over the dish.
* **Feedback:** When the user clicks to drop an antibiotic, trigger a small ripple animation (ring expanding) at the click site.
* **Bacteria Rendering:**
* **Susceptible:** Small, hollow green circles `stroke(0, 200, 100)`.
* **Resistant:** Solid red circles `fill(255, 50, 50)`.
* *Reasoning:* Solid feels "heavier" and "stronger" than hollow.



## 5. Implementation Steps for Agent

1. **Install Fonts:** Add `@import` for 'Syne' and 'Space Mono' to the global CSS.
2. **Apply CSS Variables:** Paste the `:root` variables into `globals.css` (or Tailwind config).
3. **Refactor `PetriDish.tsx`:** Update the `draw()` function to use the new colors and stroke weights.
4. **Refactor `StatsPanel.tsx`:** distinct from the canvas, using absolute positioning to place the text in the corners.
5. **Refactor `Controls.tsx`:** Build the bottom floating bar.