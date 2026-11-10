"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import ProgressRing from "@/modules/core/components/progress-ring.component";
import Slider from "@/modules/core/components/slider.component";
import type { ToastData } from "@/modules/core/components/toast.component";
import { ICON_BTN, KICKER, PRIMARY_BTN, SCRIM, objColor } from "@/modules/core/components/ui";
import { CELEBRATION } from "@/modules/gamification/data/example-gamification.data";
import { goalsRepository } from "@/modules/goals/data";
import Broto, { type BrotoMood } from "@/modules/landing/components/broto.component";
import { activationRepository, type EnergyLevel, type RampResponse, type SessionOutcome } from "../data";
import { energyForRamp } from "../logic/energy.logic";
import {
  RAMP_ICONS,
  RAMP_NAMES,
  createRampState,
  currentOption,
  formatTimer,
  rampReducer,
  stepSeconds,
  type RampAction,
  type RampState,
} from "../logic/ramp.logic";

// W32–W41: modal da rampa sobre o Hoje (ModalRampa.dc.html).
export interface RampTarget {
  goalId: string;
  stepId: string;
  blockId: string | null;
}

interface RampModalProps {
  target: RampTarget;
  energy: EnergyLevel | null;
  /** changed = houve registro (o Hoje recarrega o plano). */
  onClose: (changed: boolean) => void;
  onToast: (t: ToastData) => void;
  /** Avisado logo depois do registro, para o Hoje ao fundo já aparecer recalculado (W41). */
  onRecorded?: () => void;
}

const MOODS: BrotoMood[] = ["ok", "animado", "ok", "focado"];
const SPEEDS = [1, 10, 60];

interface Info {
  goalTitle: string;
  stepTitle: string;
  colorIndex: number;
}

function Ramp({ ramp, info, target, energy, onClose, onToast, onRecorded }: RampModalProps & { ramp: RampResponse; info: Info }) {
  const reducer = (s: RampState, a: RampAction) => rampReducer(s, a, ramp);
  const [s, dispatch] = useReducer(reducer, ramp, createRampState);
  const startedAt = useRef(new Date().toISOString());
  const prevCompleted = useRef(0);

  useEffect(() => {
    let last = performance.now();
    const iv = setInterval(() => {
      const now = performance.now();
      const real = Math.min(5, (now - last) / 1000);
      last = now;
      dispatch({ type: "tick", seconds: real });
    }, 250);
    return () => clearInterval(iv);
  }, []);

  // Cada degrau concluído rende o toast "+5 gotas" (valor fixo do protótipo, P18).
  useEffect(() => {
    if (s.completedSteps > prevCompleted.current) onToast({ title: "+5 gotas", sub: "Degrau concluído", icon: "drop" });
    prevCompleted.current = s.completedSteps;
  }, [s.completedSteps, onToast]);

  const register = async (outcome: SessionOutcome) => {
    const res = await activationRepository.recordSession({
      goalId: target.goalId,
      stepId: target.stepId,
      blockId: target.blockId,
      energy: energyForRamp(energy),
      availableTime: null,
      startedAt: startedAt.current,
      endedAt: new Date().toISOString(),
      focusedMinutes: Math.round(s.focusSeconds / 60),
      outcome,
      partialPct: outcome === "partial" ? s.partialPct : null,
    });
    onRecorded?.();
    if (outcome === "not_done") {
      onToast({ title: "Tudo bem", sub: "Fica pra próxima, sem drama", icon: "plant" });
      onClose(true);
      return;
    }
    dispatch({ type: "registered", outcome, goalProgressPct: res.goalProgressPct });
  };

  const i = Math.min(s.stepIndex, 3);
  const isRamp = s.phase === "ramp";
  const isFocus = isRamp && s.stepIndex === 3;
  const option = currentOption(s, ramp);
  const total = stepSeconds(ramp, i, s.optionIndex);
  const durLabel = (k: number) => (k === 4 ? "1 min" : ramp.steps[k]?.options[0]?.durationLabel ?? "");
  const changed = s.phase === "celebrate";

  return (
    <div
      role="dialog"
      aria-label="Rampa até o foco"
      className={`box-border flex max-h-full w-[880px] max-w-full flex-col gap-6 overflow-auto rounded-[24px] border border-border px-8 pt-6 pb-8 transition-[background] duration-300 ${isFocus ? "bg-blue-soft" : "bg-surface"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`flex items-center gap-2 ${KICKER}`}>
            <span className="h-2 w-2 rounded-full" style={{ background: objColor(info.colorIndex) }} />
            Rampa · {info.goalTitle}
          </span>
          <h2 className="mt-1.5 mb-0 font-fredoka text-[28px]/[36px] font-semibold">{info.stepTitle}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div title="Acelera o tempo só na demo" className="flex items-center gap-2">
            <span className={KICKER}>Demo</span>
            <div className="flex gap-0.5 rounded-full bg-s2 p-[3px]">
              {SPEEDS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => dispatch({ type: "setSpeed", speed: v })}
                  className={`h-[30px] cursor-pointer rounded-full border px-2.5 text-[12px]/none font-extrabold text-tx ${s.speed === v ? "border-border bg-surface" : "border-transparent bg-transparent"}`}
                >
                  {v}×
                </button>
              ))}
            </div>
          </div>
          <button type="button" aria-label="Fechar" onClick={() => onClose(changed)} className={ICON_BTN}>
            <i className="ph ph-x text-[24px]" />
          </button>
        </div>
      </div>

      {s.phase !== "celebrate" && (
        <div className="flex flex-col gap-3">
          <div className="flex h-40 items-end gap-2">
            {RAMP_NAMES.map((name, k) => {
              const done = k < s.stepIndex;
              const cur = k === s.stepIndex;
              const icon = done ? "ph-bold ph-check" : cur ? `ph-fill ph-${RAMP_ICONS[k]}` : `ph ph-${RAMP_ICONS[k]}`;
              return (
                <div
                  key={name}
                  className={`box-border flex min-w-0 flex-1 flex-col gap-0.5 rounded-[16px_16px_8px_8px] border p-3 transition-[background,color] duration-[250ms] ${
                    cur ? "border-transparent bg-pri text-pri-tx shadow-[0_3px_0_var(--lip)]" : done ? "border-transparent bg-pri-soft text-pri" : "border-border bg-surface text-tx"
                  }`}
                  style={{ height: 104 + k * 14 }}
                >
                  <i className={`${icon} mb-1 text-[22px]`} />
                  <span className="text-[14px]/[18px] font-extrabold">{name}</span>
                  <span className="text-[12px]/[16px] font-semibold opacity-85">{durLabel(k)}</span>
                  <span className="flex items-center gap-0.5 font-fredoka text-[12px]/[16px] font-semibold">
                    <i className={`ph-fill ph-drop text-[12px] ${!done && !cur ? "text-blue-fill" : ""}`} />+5
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px]/[20px] font-bold">
              Degrau {s.stepIndex + 1} de 5 · {RAMP_NAMES[s.stepIndex]}
            </span>
            <span className="flex gap-0.5">
              {isRamp && s.stepIndex < 3 && (ramp.steps[s.stepIndex]?.options.length ?? 0) > 1 && (
                <button type="button" onClick={() => dispatch({ type: "swap" })} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-3 text-[14px]/none font-extrabold text-blue hover:bg-blue-soft">
                  <i className="ph-bold ph-arrows-clockwise text-[16px]" />Trocar
                </button>
              )}
              <button type="button" onClick={() => dispatch({ type: "skip" })} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-3 text-[14px]/none font-extrabold text-blue hover:bg-blue-soft">
                Pular<i className="ph-bold ph-skip-forward text-[16px]" />
              </button>
            </span>
          </div>
        </div>
      )}

      {isRamp && (
        <div className={`grid items-center gap-8 py-2 ${isFocus ? "grid-cols-[200px_minmax(0,1fr)]" : "grid-cols-[180px_minmax(0,1fr)]"}`}>
          <div className="flex justify-center">
            <Broto size={isFocus ? 160 : 140} mood={MOODS[i]} />
          </div>
          <div className={`flex flex-col gap-5 ${isFocus ? "items-center" : "items-start"}`}>
            <span className={KICKER}>{isFocus ? "Sessão de foco" : `${RAMP_NAMES[i]} · ${durLabel(i)}`}</span>
            <p className={`m-0 font-fredoka text-[28px]/[36px] font-semibold text-balance ${isFocus ? "text-center" : "text-left"}`}>
              {isFocus ? `Foco em: ${info.stepTitle}` : option?.title}
            </p>
            <div className="relative" style={{ width: isFocus ? 260 : 148, height: isFocus ? 260 : 148 }}>
              <ProgressRing
                size={isFocus ? 260 : 148}
                fraction={1 - Math.max(0, s.remainingSeconds) / total}
                color={isFocus ? "var(--blueFill)" : "var(--fill)"}
                track="var(--surface)"
                transition="stroke-dashoffset .25s linear"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <b className={`font-fredoka font-semibold text-tx tabular-nums ${isFocus ? "text-[64px]/none" : "text-[36px]/none"}`}>{formatTimer(s.remainingSeconds)}</b>
                <span className="mt-1.5 text-[12px]/[16px] font-bold text-tx2">{isFocus ? (s.paused ? "pausado" : "foco") : "aquecimento"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isFocus ? (
                <>
                  <button type="button" onClick={() => dispatch({ type: "togglePause" })} className="flex h-[52px] cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-surface px-6 text-[16px]/none font-extrabold text-blue shadow-[0_3px_0_var(--border)] active:translate-y-[3px] active:shadow-none">
                    <i className={`${s.paused ? "ph-fill ph-play" : "ph-bold ph-pause"} text-[18px]`} />
                    {s.paused ? "Continuar" : "Pausar"}
                  </button>
                  <button type="button" onClick={() => dispatch({ type: "complete" })} className="h-11 cursor-pointer rounded-full bg-transparent px-4 text-[15px]/none font-extrabold text-blue hover:bg-blue-soft">
                    Terminar foco
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => dispatch({ type: "complete" })} className={PRIMARY_BTN}>
                  Concluí o degrau<i className="ph-bold ph-check text-[16px]" />
                </button>
              )}
            </div>
            {isFocus && s.paused && (
              <span className="text-[14px]/[20px] font-semibold text-tx2">Pausado. Quando voltar, eu te dou um mini-degrau de 2 min.</span>
            )}
          </div>
        </div>
      )}

      {s.phase === "register" && (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <Broto size={110} />
          <p className="m-0 max-w-[560px] font-fredoka text-[28px]/[36px] font-semibold text-balance">Quanto você avançou em “{info.stepTitle}”?</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => register("done")} className={PRIMARY_BTN}>
              <i className="ph-bold ph-check text-[16px]" />Concluí
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "togglePartial" })}
              className={`h-[52px] cursor-pointer rounded-full border-2 px-6 text-[16px]/none font-extrabold text-blue shadow-[0_3px_0_var(--border)] active:translate-y-[3px] active:shadow-none ${s.partialOpen ? "border-pri bg-s2" : "border-border bg-surface"}`}
            >
              Parcial
            </button>
            <button type="button" onClick={() => register("not_done")} className="h-[52px] cursor-pointer rounded-full bg-transparent px-5 text-[16px]/none font-extrabold text-blue hover:bg-blue-soft">
              Não rolou
            </button>
          </div>
          {s.partialOpen && (
            <div className="flex w-[420px] flex-col gap-3 rounded-[16px] border border-border bg-surface p-4">
              <div className="flex items-baseline justify-between">
                <b className="text-[14px]/[20px] font-extrabold">Quanto foi?</b>
                <b className="font-fredoka text-[24px]/none font-semibold text-pri">{s.partialPct}%</b>
              </div>
              <Slider label="Quanto foi?" value={s.partialPct} scaleMin={0} scaleMax={100} min={5} max={95} step={5} onChange={(pct) => dispatch({ type: "setPartialPct", pct })} valueText={`${s.partialPct}%`} />
              <button type="button" onClick={() => register("partial")} className="h-12 cursor-pointer rounded-full border-2 border-border bg-surface text-[15px]/none font-extrabold text-blue">
                Registrar {s.partialPct}% · +{CELEBRATION.dropsPartial} gotas
              </button>
            </div>
          )}
        </div>
      )}

      {s.phase === "celebrate" && (
        <div className="relative flex flex-col items-center gap-2.5 py-2 text-center">
          <Broto size={150} mood="comemorando" />
          <span className="flex items-center gap-2.5">
            <i className="ph-fill ph-drop text-[36px] text-blue-fill" />
            <b className="font-fredoka text-[44px]/[52px] font-bold">+{s.outcome === "partial" ? CELEBRATION.dropsPartial : CELEBRATION.dropsDone} gotas</b>
          </span>
          <span className="text-[18px]/[26px] font-semibold">
            {s.outcome === "partial" ? `${s.partialPct}% de “${info.stepTitle}” registrado` : `“${info.stepTitle}” concluída`}
          </span>
          <span className="text-[14px]/[20px] font-semibold text-tx2">
            +{CELEBRATION.rampDrops} gotas da rampa · +{CELEBRATION.focusXp} XP de foco · {info.goalTitle} agora em {s.goalProgressPct}%
          </span>
          <button type="button" onClick={() => onClose(true)} className={`mt-4 ${PRIMARY_BTN}`}>
            Voltar pro meu dia
          </button>
        </div>
      )}
    </div>
  );
}

export default function RampModal(props: RampModalProps) {
  const { target, energy } = props;
  const [data, setData] = useState<{ ramp: RampResponse; info: Info } | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      goalsRepository.get(target.goalId),
      activationRepository.getRamp({ goalId: target.goalId, stepId: target.stepId, energy: energyForRamp(energy) }),
    ]).then(([g, ramp]) => {
      const step = g.steps.find((x) => x.id === target.stepId);
      if (alive) setData({ ramp, info: { goalTitle: g.goal.title, stepTitle: step?.title ?? "", colorIndex: g.goal.colorIndex } });
    });
    return () => {
      alive = false;
    };
    // A rampa é montada uma vez por abertura do modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.goalId, target.stepId]);

  return (
    <div className={`fixed inset-0 z-[60] box-border flex items-center justify-center p-8 ${SCRIM}`}>
      {data && <Ramp {...props} ramp={data.ramp} info={data.info} />}
    </div>
  );
}
