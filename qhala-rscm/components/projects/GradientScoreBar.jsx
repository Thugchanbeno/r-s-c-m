"use client";
import React, { useEffect, useState } from "react";
import { RSCM_COLORS } from "@/components/charts/ChartComponents";

const GradientScoreBar = ({ score, label = "Match" }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const percentage = Math.min(Math.max(score, 0), 100);
      setWidth(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const thresholds = [
    { pos: 60, label: "Good" },
    { pos: 85, label: "Strong" },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: RSCM_COLORS.darkPurple }}
        >
          {label}
        </span>
        <span
          className="text-sm font-black"
          style={{ color: RSCM_COLORS.violet }}
        >
          {width.toFixed(0)}
          <span className="text-[10px] font-medium text-gray-400 ml-0.5">
            %
          </span>
        </span>
      </div>

      <div className="relative h-3.5 w-full bg-gray-200 rounded-full shadow-inner overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: `linear-gradient(90deg, 
              #ef4444 0%,   /* Red */
              #f97316 35%,  /* Orange */
              #eab308 60%,  /* Yellow */
              #84cc16 85%,  /* Lime */
              #10b981 100%) /* Green */`,
          }}
        />

        <div
          className="absolute top-0 right-0 h-full bg-gray-100 transition-all duration-1000 ease-out"
          style={{
            width: `${100 - width}%`,
            borderLeft: "1px solid rgba(255,255,255,0.5)",
          }}
        />
        <div className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

        {thresholds.map((t) => (
          <div
            key={t.pos}
            className="absolute top-0 bottom-0 w-px bg-white/60 z-20 mix-blend-overlay"
            style={{ left: `${t.pos}%` }}
          />
        ))}
      </div>

      <div className="relative h-3 w-full mt-1">
        {thresholds.map((t) => (
          <div
            key={t.pos}
            className="absolute transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${t.pos}%` }}
          >
            <div className="w-px h-1 bg-gray-300 mb-0.5" />
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradientScoreBar;
