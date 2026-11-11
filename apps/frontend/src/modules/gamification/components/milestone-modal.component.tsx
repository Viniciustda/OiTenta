"use client";

import { useEffect } from "react";
import { PRIMARY_BTN } from "@/modules/core/components/ui";
import Broto from "@/modules/landing/components/broto.component";
import { GAMIFICATION, MILESTONE } from "../data/example-gamification.data";

// Modal de conquista com confete (Bora App.dc.html, "hasCelebrate"), com os valores fixos do P18.
// Fecha no "Bora!", no clique no fundo ou sozinho depois de 3 s, como no protótipo.
const CONFETTI_COLORS = ["var(--streak)", "var(--blueFill)", "var(--broto-leaf)"];
const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 37) % 100,
  delay: ((i * 7) % 10) / 20,
  color: CONFETTI_COLORS[i % 3],
}));

export default function MilestoneModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div onClick={onClose} className="fixed inset-0 z-[90] flex animate-[fadeIn_.2s] items-center justify-center bg-scrim">
      <div
        role="dialog"
        aria-label="Conquista"
        onClick={(e) => e.stopPropagation()}
        className="relative box-border flex w-[440px] animate-[riseIn_.35s_cubic-bezier(.3,1.6,.5,1)] flex-col items-center gap-3 overflow-hidden rounded-[24px] border border-border bg-surface px-8 pt-10 pb-8 text-center"
      >
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="absolute top-0 h-1.5 w-2.5 rounded-[2px] opacity-0"
            style={{ left: `${c.x}%`, background: c.color, animation: `confetti 2.6s ${c.delay}s ease-in forwards` }}
          />
        ))}
        <Broto size={150} stage={GAMIFICATION.stage} mood="comemorando" />
        <span className="text-[12px]/[16px] font-extrabold tracking-[.06em] text-[var(--streakInk)] uppercase">{MILESTONE.kicker}</span>
        <b className="font-fredoka text-[44px]/[52px] font-bold">{MILESTONE.title}</b>
        <span className="text-[16px]/[24px] text-pretty text-tx2">{MILESTONE.sub}</span>
        <button type="button" onClick={onClose} className={`mt-3 ${PRIMARY_BTN}`}>
          Bora!
        </button>
      </div>
    </div>
  );
}
