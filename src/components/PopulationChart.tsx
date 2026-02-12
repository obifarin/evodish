import React from "react";
import { PopulationSnapshot } from "@/types";

interface PopulationChartProps {
  history: PopulationSnapshot[];
}

const PopulationChart: React.FC<PopulationChartProps> = ({ history }) => {
  if (history.length < 2) return null;

  const width = 150;
  const height = 50;
  const padding = 2;
  const plotHeight = height - padding * 2;

  const maxPop = Math.max(
    ...history.map(h => Math.max(h.susceptible, h.resistant)),
    1
  );

  const toPath = (getValue: (h: PopulationSnapshot) => number) => {
    return history
      .map((h, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = padding + plotHeight - (getValue(h) / maxPop) * plotHeight;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="font-mono text-[10px] uppercase">
      <h2 className="text-[9px] font-bold opacity-30 tracking-widest mb-2">POPULATION</h2>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Grid lines */}
        <line
          x1="0" y1={height - padding}
          x2={width} y2={height - padding}
          stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"
        />
        <line
          x1="0" y1={height / 2}
          x2={width} y2={height / 2}
          stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Susceptible line */}
        <path
          d={toPath(h => h.susceptible)}
          fill="none"
          stroke="var(--accent-green)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Resistant line */}
        <path
          d={toPath(h => h.resistant)}
          fill="none"
          stroke="var(--accent-rust)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Legend */}
      <div className="flex gap-3 mt-1.5 text-[8px] opacity-50">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-px bg-[var(--accent-green)]" />
          <span>SUS</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-px bg-[var(--accent-rust)]" />
          <span>RES</span>
        </div>
      </div>
    </div>
  );
};

export default PopulationChart;
