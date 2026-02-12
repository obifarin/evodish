import React from "react";

interface StatsPanelProps {
  susceptible: number;
  resistant: number;
  side: "left" | "right";
}

const StatsPanel: React.FC<StatsPanelProps> = ({ susceptible, resistant, side }) => {
  if (side === "left") {
    return (
      <div className="flex flex-col justify-center items-start gap-4 w-28 sm:w-36 md:w-48 shrink-0 px-2 font-mono text-[10px] uppercase">
        {/* Metadata */}
        <div className="flex flex-col gap-1 opacity-60">
          <div className="flex gap-2">
            <span className="opacity-60">STRAIN:</span>
            <span>B_SUBTILIS_01</span>
          </div>
          <div className="flex gap-2">
            <span className="opacity-60">STATUS:</span>
            <span className={resistant > 50 ? "text-[var(--accent-rust)] animate-pulse font-bold" : ""}>
              {resistant > 50 ? "MUTATING" : "UNIFORM"}
            </span>
          </div>
        </div>

        {/* Susceptible Count */}
        <div className="flex flex-col">
          <h2 className="text-[9px] font-bold opacity-30 tracking-widest mb-1">SUSCEPTIBLE</h2>
          <div className="font-serif text-4xl sm:text-5xl md:text-7xl font-black text-[var(--accent-green)] leading-none">
            {susceptible.toString().padStart(3, '0')}
          </div>
        </div>

        {/* Bottom label */}
        <div className="flex flex-col gap-0.5 opacity-50 mt-2">
          <div className="text-[9px]">INCUBATOR 07</div>
          <div className="font-bold tracking-widest text-[10px]">SPECIMEN ALPHA</div>
        </div>
      </div>
    );
  }

  // Right side
  return (
    <div className="flex flex-col justify-center items-end gap-4 w-28 sm:w-36 md:w-48 shrink-0 px-2 font-mono text-[10px] uppercase text-right overflow-hidden">
      {/* Metadata */}
      <div className="flex flex-col gap-1 opacity-60">
        <div className="flex gap-2 justify-end">
          <span className="opacity-60">FRAME:</span>
          <span className="tabular-nums">{Math.floor(Date.now() / 100) % 100000}</span>
        </div>
        <div className="opacity-40">[ EVOLUTIONARY_PROTOCOL ]</div>
      </div>

      {/* Resistant Count */}
      <div className="flex flex-col items-end">
        <h2 className="text-[9px] font-bold opacity-30 tracking-widest mb-1">RESISTANT</h2>
        <div className="font-serif text-4xl sm:text-5xl md:text-7xl font-black text-[var(--accent-rust)] leading-none">
          {resistant.toString().padStart(3, '0')}
        </div>
      </div>

      {/* Bottom label */}
      <div className="flex flex-col gap-0.5 opacity-50 mt-2 items-end">
        <div className="font-bold tracking-widest">BIOSAFETY_L4</div>
        <div className="text-[9px]">EST. SATURATION: {((susceptible + resistant) / 20).toFixed(0)}%</div>
      </div>
    </div>
  );
};

export default StatsPanel;
