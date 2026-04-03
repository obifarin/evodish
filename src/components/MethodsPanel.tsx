"use client";

import React, { useEffect } from "react";
import { BookOpenText, FlaskConical, Microscope, X } from "lucide-react";
import {
  ADVANCED_MODE_DESCRIPTION,
  GRADIENT_DESCRIPTION,
  advancedControlDefinitions,
  baseControlDefinitions,
  experimentControlDefinitions,
  getControlValue,
} from "@/content/simulationContent";
import { SimulationParameters } from "@/types";

interface MethodsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: SimulationParameters;
}

interface MethodsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface CurrentSetupEntry {
  label: string;
  value: string;
  isInactive?: boolean;
}

const modelAtAGlance = [
  "Each run begins with 50 susceptible cells placed at random inside the dish.",
  "You add antibiotic pressure by clicking the dish to place one or more discs.",
  "Cells can only be in one of two inherited states: susceptible or resistant.",
  "Resistance can appear through mutation during division, or through conjugation in advanced mode.",
];

const simulationUpdates = [
  "Every unpaused frame, the simulation advances by one tick and redraws the dish.",
  "Susceptible cells inside an antibiotic disc lose health. In advanced mode, the disc also has a stress halo just outside the lethal zone.",
  "Cells die if their health reaches zero or if they age past the lifespan limit.",
  "Surviving cells drift in a random direction, then get clipped back inside the dish boundary.",
  "Cells can only divide after a 100-frame cooldown. Division is probabilistic, not scheduled.",
  "When a susceptible cell divides, the offspring may become resistant based on the mutation setting. In the stress halo, that mutation chance is multiplied by 10.",
  "Advanced mode also checks nearby cells for conjugation every 3 frames, allowing resistant cells to convert susceptible neighbors by chance.",
  "Population counts are sampled every 10 frames for the counters and chart, so the readout is slightly coarser than the visual animation.",
];

const visualGuide = [
  "Green outlined circles are susceptible cells. Rust filled circles are resistant cells.",
  "Dashed rings mark antibiotic zones. In advanced mode, the outer faded halo marks the stress region around each disc.",
  "Bright magenta lines mark conjugation events when resistance is transferred between nearby cells.",
  "The left and right counters track susceptible and resistant counts separately, while the HGT counter tracks cumulative transfer events.",
  "The chart shows recent population history only. It is a rolling window, not the entire run from frame 0 onward.",
];

const biologyGrounding = [
  "The app correctly captures selection pressure: antibiotics kill susceptible cells more often than resistant ones, changing which traits spread.",
  "Resistance is treated as heritable, so successful resistant offspring can expand after susceptible competitors are removed.",
  "Advanced mode includes contact-dependent horizontal gene transfer, reflecting the real biological importance of conjugation in spreading resistance genes.",
  "The fitness cost slider captures a real biological tradeoff: resistance can help under drug pressure but can also reduce growth in drug-free conditions.",
];

const limitations = [
  "Mutation is intentionally inflated for visibility. Real resistance mutations are usually much rarer than the values shown here.",
  "Resistance is binary in EvoDish. Real microbes can show partial resistance, tolerance, dose dependence, or multiple mechanisms at once.",
  "Antibiotic discs create fixed circular zones. The model does not simulate diffusion, decay, concentration curves, or changing MIC thresholds over time.",
  "Cell movement is random mixing. It does not reproduce realistic colony expansion, biofilm structure, or growth on agar surfaces.",
  "Resistant cells are effectively fully protected from antibiotics in this model, which is simpler than most real resistance phenotypes.",
  "Age-based death and the hard population cap are simulation devices that stand in for resource limits and turnover.",
  "The advanced-mode 10x mutation halo is a teaching device that exaggerates stress-linked mutational dynamics for clarity.",
  "Conjugation is simplified to proximity plus chance, without plasmid compatibility rules, host range limits, or species-specific barriers.",
];

function MethodsSection({ title, children }: MethodsSectionProps) {
  return (
    <section className="border-t border-black/10 pt-5">
      <h2 className="font-serif text-2xl font-black tracking-tight text-black">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[13px] leading-6 text-black/80 normal-case">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-rust)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const MethodsPanel: React.FC<MethodsPanelProps> = ({
  isOpen,
  onClose,
  parameters,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentSetup: CurrentSetupEntry[] = [
    ...baseControlDefinitions.map((control) => ({
      label: control.summaryLabel,
      value: control.formatValue(getControlValue(parameters, control.key)),
    })),
    {
      label: "Advanced mode",
      value: parameters.advancedMode ? "ON" : "OFF",
    },
    ...advancedControlDefinitions.map((control) => ({
      label: control.summaryLabel,
      value: control.formatValue(getControlValue(parameters, control.key)),
      isInactive: !parameters.advancedMode,
    })),
    {
      label: "Experiment mode",
      value: parameters.isExperimentMode ? "ON" : "OFF",
    },
    ...experimentControlDefinitions.map((control) => ({
      label: control.summaryLabel,
      value: control.formatValue(getControlValue(parameters, control.key)),
      isInactive: !parameters.isExperimentMode,
    })),
  ];

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-end justify-end p-3 sm:p-4 pointer-events-none">
        <aside
          aria-labelledby="methods-title"
          aria-modal="true"
          className="pointer-events-auto flex h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--bg-cream)] text-[var(--ink-black)] shadow-[0_24px_80px_rgba(0,0,0,0.22)] cursor-auto sm:h-[calc(100dvh-2rem)] sm:max-w-[40rem] sm:rounded-[2rem]"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <header className="relative overflow-hidden border-b border-black/10 bg-[var(--bg-cream)] px-5 py-5 sm:px-7">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-black/50">
                  <span className="pill-label bg-white/80 border-black/5">
                    Methods
                  </span>
                  <span className="pill-label border-[var(--accent-rust)] text-[var(--accent-rust)] bg-[var(--bg-cream)]">
                    Educational Model
                  </span>
                  <a
                    href="https://www.youtube.com/watch?v=k-bB78I8-_s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-label flex items-center gap-1.5 border-black/10 bg-white/80 transition-all hover:border-black/20 hover:bg-white hover:text-black"
                  >
                    <Play size={10} className="fill-current text-[var(--accent-rust)]" />
                    Video Guide
                  </a>
                </div>
                <div>
                  <h1
                    id="methods-title"
                    className="font-serif text-4xl font-black leading-none tracking-tight text-black"
                  >
                    How EvoDish Works
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70 normal-case">
                    EvoDish is designed to make evolutionary logic visible. It
                    is scientifically grounded in broad ideas about mutation,
                    selection, and gene transfer, but it is not a predictive lab
                    simulation.
                  </p>
                </div>
              </div>

              <button
                aria-label="Close methods panel"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 text-black/70 transition-colors hover:border-black/20 hover:text-black focus:outline-none focus:ring-2 focus:ring-[var(--accent-rust)]"
                onClick={onClose}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5 sm:px-7">
            <section className="rounded-[1.5rem] border border-black/10 bg-white/50 p-4 sm:p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                <BookOpenText size={14} />
                <span>Current setup</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {currentSetup.map((entry) => (
                  <div
                    key={entry.label}
                    className={`rounded-2xl border px-3 py-2.5 ${
                      entry.isInactive
                        ? "border-black/5 bg-black/[0.03] text-black/45"
                        : "border-black/8 bg-[var(--bg-cream)] text-black/80"
                    }`}
                  >
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.24em]">
                      {entry.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold normal-case">
                      {entry.value}
                    </div>
                    {entry.isInactive && (
                      <div className="mt-1 text-[10px] uppercase tracking-[0.18em]">
                        inactive now
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-6 space-y-6">
              <MethodsSection title="Model at a glance">
                <BulletList items={modelAtAGlance} />
              </MethodsSection>

              <MethodsSection title="How the simulation updates">
                <BulletList items={simulationUpdates} />
              </MethodsSection>

              <MethodsSection title="What each control changes">
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                      <Microscope size={14} />
                      <span>Base controls</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      {baseControlDefinitions.map((control) => (
                        <div
                          key={control.key}
                          className="rounded-[1.25rem] border border-black/10 bg-white/45 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black/55">
                              {control.summaryLabel}
                            </h3>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-rust)]">
                              {control.formatValue(
                                getControlValue(parameters, control.key),
                              )}
                            </span>
                          </div>
                          <p className="mt-2">{control.methodsDescription}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                      <FlaskConical size={14} />
                      <span>Advanced mode</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-[1.25rem] border border-black/10 bg-white/45 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black/55">
                            Toggle
                          </h3>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-rust)]">
                            {parameters.advancedMode ? "ON" : "OFF"}
                          </span>
                        </div>
                        <p className="mt-2">{ADVANCED_MODE_DESCRIPTION}</p>
                      </div>

                      {advancedControlDefinitions.map((control) => (
                        <div
                          key={control.key}
                          className={`rounded-[1.25rem] border px-4 py-3 ${
                            parameters.advancedMode
                              ? "border-black/10 bg-white/45"
                              : "border-black/5 bg-black/[0.03] text-black/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black/55">
                              {control.summaryLabel}
                            </h3>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-rust)]">
                              {control.formatValue(
                                getControlValue(parameters, control.key),
                              )}
                            </span>
                          </div>
                          <p className="mt-2">{control.methodsDescription}</p>
                          {!parameters.advancedMode && (
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">
                              Stored value. This only affects the run when
                              advanced mode is on.
                            </p>
                          )}
                        </div>
                      ))}

                      <div
                        className={`rounded-[1.25rem] border px-4 py-3 ${
                          parameters.advancedMode
                            ? "border-black/10 bg-white/45"
                            : "border-black/5 bg-black/[0.03] text-black/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black/55">
                            Gradient halo
                          </h3>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-rust)]">
                            {parameters.advancedMode ? "ON" : "OFF"}
                          </span>
                        </div>
                        <p className="mt-2">{GRADIENT_DESCRIPTION}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                      <BookOpenText size={14} />
                      <span>Experiment tools</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div
                        className={`rounded-[1.25rem] border px-4 py-3 ${
                          parameters.isExperimentMode
                            ? "border-black/10 bg-white/45"
                            : "border-black/5 bg-black/[0.03] text-black/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black/55">
                            Auto-stop
                          </h3>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-rust)]">
                            {parameters.isExperimentMode ? "ON" : "OFF"}
                          </span>
                        </div>
                        <p className="mt-2">
                          Auto-stop freezes the run at a chosen frame so you can
                          compare conditions more consistently. It is an
                          experiment tool, not a biological mechanism.
                        </p>
                      </div>

                      {experimentControlDefinitions.map((control) => (
                        <div
                          key={control.key}
                          className={`rounded-[1.25rem] border px-4 py-3 ${
                            parameters.isExperimentMode
                              ? "border-black/10 bg-white/45"
                              : "border-black/5 bg-black/[0.03] text-black/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black/55">
                              {control.summaryLabel}
                            </h3>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-rust)]">
                              {control.formatValue(
                                getControlValue(parameters, control.key),
                              )}
                            </span>
                          </div>
                          <p className="mt-2">{control.methodsDescription}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </MethodsSection>

              <MethodsSection title="How to read the visuals">
                <BulletList items={visualGuide} />
              </MethodsSection>

              <MethodsSection title="Where the biology is grounded">
                <BulletList items={biologyGrounding} />
              </MethodsSection>

              <MethodsSection title="Main limitations">
                <p className="text-sm leading-6 text-black/70">
                  The point of EvoDish is to show the logic of resistance
                  clearly, not to reproduce every layer of microbiology. These
                  shortcuts are deliberate and important for interpreting what
                  you see.
                </p>
                <BulletList items={limitations} />
              </MethodsSection>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default MethodsPanel;
