"use client";

import { useEffect, useRef } from "react";
import { BROTO_SUGGESTION, GRID_DAYS, GRID_HOURS, emptyGrid, toggleCell, totalHours, type HourGrid } from "../logic/availability-grid.logic";

// Grade de horários livres (AvailGrid.dc.html): pintar arrastando o mouse, "Limpar" e "Usar sugestão do Broto".
// Sem células de ocupado: o MVP não tem compromissos cadastrados (P8).
interface AvailGridProps {
  grid: HourGrid;
  onChange: (g: HourGrid) => void;
  cellHeight?: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function AvailGrid({ grid, onChange, cellHeight = 28 }: AvailGridProps) {
  const drag = useRef<{ on: boolean } | null>(null);

  useEffect(() => {
    const up = () => {
      drag.current = null;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const set = (d: number, h: number, on: boolean) => {
    const next = toggleCell(grid, d, h, on);
    if (next !== grid) onChange(next);
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-1">
        <span />
        {GRID_DAYS.map((d) => (
          <span key={d} className="text-center text-[12px]/[16px] font-extrabold tracking-[.06em] text-tx2 uppercase">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-1" onMouseLeave={() => (drag.current = null)}>
        <div className="flex flex-col gap-0.5">
          {GRID_HOURS.map((h) => (
            <span key={h} className="flex items-center text-[12px]/none font-semibold text-tx2" style={{ height: cellHeight }}>{pad(h)}h</span>
          ))}
        </div>
        {GRID_DAYS.map((day, d) => (
          <div key={day} className="flex flex-col gap-0.5">
            {GRID_HOURS.map((h) => {
              const on = grid[d].includes(h);
              return (
                <div
                  key={h}
                  title={`${day} ${h}h–${h + 1}h`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    drag.current = { on: !on };
                    set(d, h, !on);
                  }}
                  onMouseEnter={() => drag.current && set(d, h, drag.current.on)}
                  className={`box-border cursor-pointer rounded-[6px] border transition-[background] duration-[80ms] ${on ? "border-pri bg-pri-soft" : "border-border bg-surface"}`}
                  style={{ height: cellHeight }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-4 text-[12px]/[16px] font-bold text-tx2">
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-[4px] border border-pri bg-pri-soft" />
            Livre · {totalHours(grid)}h por semana
          </span>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => onChange(emptyGrid())} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-3 text-[14px]/none font-extrabold text-blue hover:bg-blue-soft">
            <i className="ph-bold ph-eraser text-[16px]" />Limpar
          </button>
          <button type="button" onClick={() => onChange(BROTO_SUGGESTION.map((x) => [...x]))} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-3 text-[14px]/none font-extrabold text-blue hover:bg-blue-soft">
            <i className="ph-bold ph-sparkle text-[16px]" />Usar sugestão do Broto
          </button>
        </div>
      </div>
    </div>
  );
}
