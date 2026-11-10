"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Slider from "@/modules/core/components/slider.component";
import { formatDuration } from "@/modules/core/format/time.format";
import Broto, { type BrotoMood } from "@/modules/landing/components/broto.component";
import AvailGrid from "../components/avail-grid.component";
import { schedulingRepository } from "../data";
import { LIMIT_DEFAULT, LIMIT_MAX, LIMIT_MIN, emptyGrid, gridToWindows, totalHours } from "../logic/availability-grid.logic";

// W05–W11 onboarding em chat com o Broto (AppOnboarding.dc.html): boas-vindas, grade, limite e pronto.
const PROGRESS = [10, 40, 70, 100];

function BrotoSays({ mood = "ok", children }: { mood?: BrotoMood; children: ReactNode }) {
  return (
    <div className="flex items-end gap-2">
      <Broto size={48} mood={mood} />
      <div className="max-w-[560px] rounded-[20px_20px_20px_6px] border border-border bg-surface px-4 py-3 text-[16px]/[24px]">{children}</div>
    </div>
  );
}

function Answer({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <span className="rounded-full bg-pri px-3.5 py-[9px] text-[15px]/none font-extrabold text-pri-tx">{children}</span>
    </div>
  );
}

const CTA = "h-[52px] cursor-pointer rounded-full border-0 px-6 text-[16px]/none font-extrabold shadow-[0_3px_0_var(--lip)] active:translate-y-[3px] active:shadow-none";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [more, setMore] = useState(false);
  const [grid, setGrid] = useState(emptyGrid);
  const [limit, setLimit] = useState(LIMIT_DEFAULT);
  const [saving, setSaving] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const total = totalHours(grid);
  const limitLabel = formatDuration(limit);

  useEffect(() => {
    if (step || more) bottom.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [step, more]);

  const finish = async () => {
    setSaving(true);
    try {
      await schedulingRepository.setAvailability({ windows: gridToWindows(grid), dailyLimitMinutes: limit });
      router.push("/hoje");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg font-nunito text-tx">
      <div className="h-1 bg-s2">
        <div className="h-full bg-fill transition-[width] duration-[400ms]" style={{ width: `${PROGRESS[step]}%` }} />
      </div>
      <header className="flex h-[72px] items-center justify-between px-10">
        <span className="flex items-center gap-2.5">
          <Broto size={36} />
          <span className="font-fredoka text-[26px]/none font-bold tracking-[-0.01em]">bora</span>
        </span>
        <span className="text-[12px]/[16px] font-extrabold tracking-[.06em] text-tx2 uppercase">Passo {step + 1} de 4</span>
      </header>
      <div className="mx-auto box-border flex w-full max-w-[800px] flex-1 flex-col gap-5 px-6 pt-6 pb-24">
        <BrotoSays mood="animado">
          Oi! Eu sou o <b className="font-fredoka font-semibold">Broto</b>. Vamos montar seu plano sem drama?
        </BrotoSays>
        {more && (
          <>
            <Answer>Me conta mais</Answer>
            <BrotoSays>
              Eu quebro seus trabalhos em degraus pequenos e encaixo nos seus horários livres. Você só precisa começar. Cada degrau rende gotas, e as gotas me regam.
            </BrotoSays>
          </>
        )}
        {step === 0 && (
          <div className="flex justify-end gap-1.5">
            {!more && (
              <button type="button" onClick={() => setMore(true)} className="h-11 cursor-pointer rounded-full border-2 border-border bg-surface px-4 text-[15px]/none font-extrabold text-blue">
                Me conta mais
              </button>
            )}
            <button type="button" onClick={() => setStep(1)} className="h-11 cursor-pointer rounded-full bg-pri px-5 text-[15px]/none font-extrabold text-pri-tx shadow-[0_3px_0_var(--lip)] active:translate-y-[3px] active:shadow-none">
              Bora!
            </button>
          </div>
        )}
        {step >= 1 && (
          <>
            <Answer>Bora!</Answer>
            <BrotoSays>
              Primeiro, me mostra quando você tá livre. <b>Pinta os horários arrastando o mouse.</b> Aula e estágio eu já marquei como ocupados.
            </BrotoSays>
          </>
        )}
        {step === 1 && (
          <div className="ml-14 flex flex-col gap-5 rounded-[16px] border border-border bg-surface p-6">
            <AvailGrid grid={grid} onChange={setGrid} cellHeight={26} />
            <button
              type="button"
              disabled={total === 0}
              onClick={() => setStep(2)}
              className={`self-end ${CTA} ${total === 0 ? "cursor-not-allowed bg-s2 text-tx2 shadow-[0_3px_0_var(--border)]" : "bg-pri text-pri-tx"}`}
            >
              Pronto, esses são meus horários
            </button>
          </div>
        )}
        {step >= 2 && (
          <>
            <Answer>{total}h livres por semana</Answer>
            <BrotoSays>Boa. E quanto tempo por dia você aguenta estudar sem fritar? Eu nunca passo desse limite.</BrotoSays>
          </>
        )}
        {step === 2 && (
          <div className="ml-14 flex flex-col gap-5 rounded-[16px] border border-border bg-surface p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px]/[20px] font-extrabold">Máximo por dia</span>
              <b className="font-fredoka text-[28px]/[36px] font-semibold text-pri">{limitLabel}</b>
            </div>
            <Slider label="Máximo por dia" value={limit} scaleMin={LIMIT_MIN} scaleMax={LIMIT_MAX} min={LIMIT_MIN} max={LIMIT_MAX} step={30} onChange={setLimit} valueText={limitLabel} />
            <div className="flex justify-between text-[12px]/[16px] font-semibold text-tx2">
              <span>1h</span>
              <span>5h</span>
            </div>
            <button type="button" onClick={() => setStep(3)} className={`self-end bg-pri text-pri-tx ${CTA}`}>
              Esse é meu limite
            </button>
          </div>
        )}
        {step >= 3 && (
          <>
            <Answer>{limitLabel} por dia</Answer>
            <BrotoSays mood="comemorando">
              Fechado. Já encaixei Eng. Software, Cálculo II e Portfólio nos seus horários verdes, sem passar de {limitLabel} por dia. Bora pro seu dia?
            </BrotoSays>
            <div className="flex justify-end">
              <button type="button" disabled={saving} onClick={finish} className={`flex items-center gap-2.5 bg-pri px-7 text-pri-tx ${CTA}`}>
                Ir pro meu dia
                <i className="ph-bold ph-arrow-right text-[18px]" />
              </button>
            </div>
          </>
        )}
        <div ref={bottom} />
      </div>
    </div>
  );
}
