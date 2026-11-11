"use client";

import { useRef } from "react";

// Controle deslizante do protótipo (limite diário W09 e registro parcial W39):
// trilho de 8 px, preenchimento --fill e botão de 28 px com borda --pri.
interface SliderProps {
  label: string;
  value: number;
  /** Escala do trilho (posição 0% e 100%). */
  scaleMin: number;
  scaleMax: number;
  /** Limites do valor. */
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  valueText?: string;
}

export default function Slider({ label, value, scaleMin, scaleMax, min, max, step, onChange, valueText }: SliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const clamp = (v: number) => Math.max(min, Math.min(max, Math.round(v / step) * step));
  const pct = ((value - scaleMin) / (scaleMax - scaleMin)) * 100;

  const fromX = (x: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    const f = Math.max(0, Math.min(1, (x - r.left) / r.width));
    const v = clamp(scaleMin + f * (scaleMax - scaleMin));
    if (v !== value) onChange(v);
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className="relative h-7 cursor-pointer touch-none outline-none"
      onPointerDown={(e) => {
        fromX(e.clientX);
        const mv = (ev: PointerEvent) => fromX(ev.clientX);
        const up = () => {
          window.removeEventListener("pointermove", mv);
          window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", mv);
        window.addEventListener("pointerup", up);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(clamp(value + step));
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(clamp(value - step));
      }}
    >
      <div className="absolute top-2.5 right-0 left-0 h-2 rounded-full bg-s2" />
      <div className="absolute top-2.5 left-0 h-2 rounded-full bg-fill" style={{ width: `${pct}%` }} />
      <div
        className="absolute top-0 box-border h-7 w-7 rounded-full border-2 border-pri bg-surface shadow-[0_2px_0_var(--lip)]"
        style={{ left: `calc(${pct}% - 14px)` }}
      />
    </div>
  );
}
