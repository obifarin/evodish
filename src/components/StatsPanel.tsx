import React from "react";

interface StatsPanelProps {
  susceptible: number;
  resistant: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ susceptible, resistant }) => {
  return (
    <>
      {/* Top Left Corner - Susceptible */}
      <div className="absolute top-24 left-8 z-10 pointer-events-none">
        <h2 className="font-mono text-xs tracking-widest text-[var(--ink-secondary)] mb-1">
          SUSCEPTIBLE COLONY
        </h2>
        <div className="font-sans text-6xl font-extrabold text-[var(--safe-green)] tabular-nums">
          {susceptible.toString().padStart(3, '0')}
        </div>
      </div>

      {/* Top Right Corner - Resistant */}
      <div className="absolute top-24 right-8 z-10 pointer-events-none text-right">
        <h2 className="font-mono text-xs tracking-widest text-[var(--ink-secondary)] mb-1">
          RESISTANT STRAIN
        </h2>
        <div className={`font-sans text-6xl font-extrabold text-[var(--alert-red)] tabular-nums ${resistant > 10 ? 'animate-pulse' : ''}`}>
          {resistant.toString().padStart(3, '0')}
        </div>
      </div>
    </>
  );
};

export default StatsPanel;
