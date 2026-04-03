import React from "react";

interface StatsPanelProps {
  susceptible: number;
  resistant: number;
  simFrame: number;
  hgtCount: number;
  side: "left" | "right";
}

const StatsPanel: React.FC<StatsPanelProps> = ({ susceptible, resistant, simFrame, hgtCount, side }) => {
  const total = susceptible + resistant;
  const resPercent = total > 0 ? ((resistant / total) * 100).toFixed(1) : "0.0";

  if (side === "left") {
    return (
      <div className="flex flex-col items-start gap-2 font-mono text-[10px] uppercase">
        {/* Metadata */}
        <div className="flex flex-col gap-1 opacity-60">
          <div className="flex gap-2">
            <span className="opacity-60">STRAIN:</span>
            <span>BACILLUS_STUBBORNUS_01</span>
          </div>
          <div className="flex gap-2">
            <span className="opacity-60">STATUS:</span>
            <span className={resistant > 50 ? "text-[var(--accent-rust)] animate-pulse font-bold" : ""}>
              {resistant > 50 ? "MUTATING" : "UNIFORM"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="opacity-60">FRAME:</span>
            <span className="tabular-nums">{simFrame.toString().padStart(5, '0')}</span>
          </div>
          <div className="flex gap-2">
            <span className="opacity-60">RES%:</span>
            <span className="tabular-nums">{resPercent}%</span>
          </div>
        </div>

        {/* Susceptible Count */}
        <div className="flex flex-col mt-2">
          <h2 className="text-[9px] font-bold opacity-30 tracking-widest mb-1">SUSCEPTIBLE</h2>
          <div className="font-serif text-4xl sm:text-5xl md:text-7xl font-black text-[var(--accent-green)] leading-none">
            {susceptible.toString().padStart(3, '0')}
          </div>
        </div>
      </div>
    );
  }

  // Right side — resistant count
  return (
    <div className="flex flex-col items-start gap-2 font-mono text-[10px] uppercase">
      {/* Right Metadata */}
      <div className="flex flex-col gap-1 opacity-60 mb-1">
        <div className="flex gap-2">
          <span className="opacity-60" title="Horizontal Gene Transfer Events">HGT EVENTS:</span>
          <span className="tabular-nums text-[var(--accent-rust)] font-bold">{hgtCount.toString().padStart(4, '0')}</span>
        </div>
      </div>
      
      {/* Resistant Count */}
      <div className="flex flex-col">
        <h2 className="text-[9px] font-bold opacity-30 tracking-widest mb-1">RESISTANT</h2>
        <div className="font-serif text-4xl sm:text-5xl md:text-7xl font-black text-[var(--accent-rust)] leading-none">
          {resistant.toString().padStart(3, '0')}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
