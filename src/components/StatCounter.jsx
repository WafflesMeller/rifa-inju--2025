// src/components/StatCounter.jsx
import React from "react";

/**
 * StatCounter - pill style for Hero (no borders)
 * Props:
 *  - title: string
 *  - value: string | node
 *  - icon: React component (lucide)
 *  - color: tailwind bg color for the icon circle (ej: "bg-indigo-500")
 *  - progress: number (0..1) optional -> draws small progress bar under value
 *  - hint: string optional smaller text under the value (e.g. "Faltan 200")
 */
const StatCounter = ({ title, value, icon: Icon, color = "bg-indigo-500", progress = null, hint = "" }) => {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-full bg-white/6 backdrop-blur-sm shadow-sm "
      role="group"
      aria-label={title}
    >
      {/* icon circle */}
      <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${color} text-white shadow`}>
        {Icon ? <Icon className="w-6 h-6" /> : null}
      </div>

      {/* text block */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline gap-3">
          <div className="text-1xl md:text-2xl font-extrabold text-white leading-none">{value}</div>
          <div className="text-sm text-white/80 font-medium">{title}</div>
        </div>

        {/* optional lower line: progress + hint */}
        <div className="mt-1 flex items-center gap-3">
          {typeof progress === "number" ? (
            <div className="flex-1 min-w-0">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%`, background: "linear-gradient(90deg,#f59e0b,#f97316)" }}
                />
              </div>
            </div>
          ) : null}

          {hint ? <div className="text-xs text-white/70 min-w-0">{hint}</div> : null}
        </div>
      </div>
    </div>
  );
};

export default StatCounter;
