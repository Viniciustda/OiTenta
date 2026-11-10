"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import RampModal, { type RampTarget } from "@/modules/activation/components/ramp-modal.component";
import type { EnergyLevel } from "@/modules/activation/data";
import { ENERGY_CHIPS, energyBrotoMood, energyMessage, heroSubtitle } from "@/modules/activation/logic/energy.logic";
import { authRepository } from "@/modules/auth/data";
import Toast, { type ToastData } from "@/modules/core/components/toast.component";
import { CARD, KICKER, objColor, objInk } from "@/modules/core/components/ui";
import { clock } from "@/modules/core/data/clock";
import { DEFAULT_TIMEZONE, formatLongDateTime, localDate } from "@/modules/core/format/time.format";
import { RECENT_BADGES, type BadgeState } from "@/modules/gamification/data/example-gamification.data";
import NewGoalModal from "@/modules/goals/components/new-goal-modal.component";
import { goalsRepository, type GoalListItem } from "@/modules/goals/data";
import Broto from "@/modules/landing/components/broto.component";
import { schedulingRepository, type PlanBlock } from "@/modules/scheduling/data";
import { buildTimeline, daySummary, goalMeta, greeting, nextBlock, nextLine } from "../logic/today.logic";

// W12–W14 Hoje (AppHoje.dc.html), com o check-in de 4 níveis (P14). A rampa (W32–W41) e o novo
// objetivo (W30 vazia, P20) abrem como modais sobre esta tela (P24).
const BADGE_STYLE: Record<BadgeState, { box: string; icon: string; name: string; sub: string }> = {
  rare: { box: "border-solid border-streak bg-[var(--streakSoft)]", icon: "text-[var(--streakInk)]", name: "text-tx", sub: "text-[var(--streakInk)]" },
  on: { box: "border-solid border-fill bg-pri-soft", icon: "text-pri", name: "text-tx", sub: "text-tx2" },
  lock: { box: "border-dashed border-border bg-s2", icon: "text-tx2", name: "text-tx2", sub: "text-tx2" },
};

const TERTIARY = "flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-3 text-[14px]/none font-extrabold text-blue hover:bg-blue-soft";

export default function TodayPage() {
  const router = useRouter();
  const params = useSearchParams();
  const now = clock.now();
  const [tz, setTz] = useState(DEFAULT_TIMEZONE);
  const [name, setName] = useState("");
  const [blocks, setBlocks] = useState<PlanBlock[] | null>(null);
  const [goals, setGoals] = useState<GoalListItem[]>([]);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [ramp, setRamp] = useState<RampTarget | null>(null);
  const [novo, setNovo] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const [closedUrl, setClosedUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { user } = await authRepository.me();
      const [day, list] = await Promise.all([
        schedulingRepository.getDayPlan(localDate(now, user.timezone)),
        goalsRepository.list(),
      ]);
      if (!alive) return;
      setName(user.name);
      setTz(user.timezone);
      setBlocks(day.blocks);
      setGoals(list.goals);
    })();
    return () => {
      alive = false;
    };
  }, [now, reloadKey]);

  // Abertura pelos outros destinos (calendário, trilha, sidebar): /hoje?goal=…&step=…&block=… ou ?novo=1.
  const urlKey = params.toString();
  const goal = params.get("goal");
  const step = params.get("step");
  const urlOpen = urlKey !== "" && urlKey !== closedUrl;
  const urlRamp: RampTarget | null = urlOpen && goal && step ? { goalId: goal, stepId: step, blockId: params.get("block") } : null;
  const activeRamp = ramp ?? urlRamp;
  const novoOpen = novo || (urlOpen && params.get("novo") === "1");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((t: ToastData) => setToast(t), []);

  const clearParams = () => {
    if (urlKey) {
      setClosedUrl(urlKey);
      router.replace("/hoje");
    }
  };

  const openRamp = (b: PlanBlock) => setRamp({ goalId: b.goalId, stepId: b.stepId, blockId: b.id });

  const next = blocks ? nextBlock(blocks) : null;
  const timeline = blocks ? buildTimeline(blocks, now, tz) : [];

  return (
    <div className="box-border grid max-w-[1200px] grid-cols-[minmax(0,1fr)_360px] items-start gap-10 px-12 pt-10 pb-16">
      <div className="flex min-w-0 flex-col gap-8">
        <div>
          <span className={KICKER}>{formatLongDateTime(now, tz)}</span>
          <h1 className="mt-2 mb-0 font-fredoka text-[40px]/[48px] font-semibold">{greeting(name)}</h1>
          <p className="mt-2 mb-0 text-[18px]/[28px] text-tx2">{blocks ? daySummary(blocks) : ""}</p>
        </div>

        <div className="flex max-w-[560px] flex-col gap-2.5">
          <span className="flex items-center gap-2 text-[14px]/[20px] font-bold text-tx2">
            <span className="h-2 w-2 rounded-full" style={{ background: next ? objColor(next.colorIndex) : "var(--border)" }} />
            {nextLine(next, now, tz)}
          </span>
          <button
            type="button"
            onClick={() => next && openRamp(next)}
            className="flex cursor-pointer items-center gap-3.5 rounded-full bg-pri py-3.5 pr-[22px] pl-3.5 text-left text-pri-tx shadow-[0_3px_0_var(--lip)] transition-[transform,box-shadow] duration-[80ms] active:translate-y-[3px] active:shadow-none active:brightness-[.94]"
          >
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-on-pri-overlay">
              <i className="ph-fill ph-play text-[22px]" />
            </span>
            <span className="flex flex-1 flex-col">
              <b className="text-[20px]/[26px] font-extrabold">Vamos começar?</b>
              <span className="text-[14px]/[20px] font-semibold opacity-90">{heroSubtitle(energy)}</span>
            </span>
            <i className="ph-bold ph-arrow-right text-[22px]" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={KICKER}>Seu dia</span>
            <button type="button" onClick={() => router.push("/calendario")} className={TERTIARY}>
              <i className="ph-bold ph-calendar-blank text-[16px]" />Ver semana
            </button>
          </div>
          <div className="flex flex-col">
            {timeline.map((t) => {
              const isNow = t.kind === "now";
              return (
                <div key={t.key} className="grid grid-cols-[56px_24px_minmax(0,1fr)] gap-2" style={{ minHeight: isNow ? 36 : 140 }}>
                  <span className={`text-[13px]/[16px] font-bold tabular-nums ${isNow ? "text-blue" : "text-tx2"}`} style={{ paddingTop: isNow ? 4 : 16 }}>
                    {t.time}
                  </span>
                  <span className="relative flex justify-center">
                    <span className="absolute top-0 bottom-0 w-0.5 bg-border" />
                    <span
                      className={`relative rounded-full border-2 border-bg ${isNow ? "bg-blue-fill" : t.done ? "bg-pri" : "bg-fill"}`}
                      style={{ marginTop: isNow ? 6 : 18, width: isNow ? 12 : 10, height: isNow ? 12 : 10 }}
                    />
                  </span>
                  <div className="min-w-0 pb-3">
                    {t.kind === "now" ? (
                      <div className={`flex h-6 items-center gap-2 text-blue ${KICKER.replace("text-tx2", "")}`}>
                        Agora<span className="h-0.5 flex-1 bg-blue opacity-35" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => !t.done && openRamp(t.block)}
                        className={`flex w-full cursor-pointer flex-col gap-2.5 rounded-[16px] bg-surface p-4 text-left text-tx shadow-card hover:border-pri ${t.isNext ? "border-2 border-pri" : "border border-border"}`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[13px]/[16px] font-bold text-tx2">
                            <span className="h-2 w-2 rounded-full" style={{ background: objColor(t.block.colorIndex) }} />
                            {t.block.goalTitle}
                          </span>
                          <span className={`flex items-center gap-1 rounded-full px-[9px] py-[3px] text-[12px]/[16px] font-extrabold ${t.done ? "bg-pri-soft text-pri" : "bg-blue-soft text-blue"}`}>
                            <i className={`ph-bold ${t.done ? "ph-check" : "ph-clock"} text-[12px]`} />
                            {t.pill}
                          </span>
                        </span>
                        <span className={`font-fredoka text-[18px]/[24px] font-semibold ${t.done ? "text-tx2" : "text-tx"}`}>{t.block.stepTitle}</span>
                        <span className="flex gap-3.5 text-[13px]/[16px] font-bold text-tx2">
                          <span className="flex items-center gap-1"><i className="ph ph-clock text-[16px]" />{t.duration}</span>
                          <span className="flex items-center gap-1"><i className="ph-fill ph-drop text-[15px] text-blue-fill" />+20</span>
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className={`flex flex-col gap-4 p-5 ${CARD}`}>
          <div className="flex items-center gap-3.5">
            <Broto size={72} mood={energyBrotoMood(energy)} />
            <div>
              <h3 className="m-0 font-fredoka text-[20px]/[26px] font-semibold">Como está sua energia?</h3>
              <p className="mt-1 mb-0 text-[14px]/[20px] font-semibold text-tx2">{energyMessage(energy)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ENERGY_CHIPS.map((c) => {
              const on = energy === c.level;
              return (
                <button
                  key={c.level}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setEnergy(c.level)}
                  className={`flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-2 pr-3 pl-2.5 text-[15px]/none font-extrabold text-tx ${on ? "border-pri bg-pri-soft" : "border-border bg-surface"}`}
                >
                  <i className={`ph-bold ph-${c.icon} text-[20px]`} aria-hidden="true" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className={KICKER}>Folga por objetivo</span>
          {goals.map((g) => {
            const late = g.slackDays != null && g.slackDays < 0;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => router.push(`/objetivos/${g.id}`)}
                className={`flex cursor-pointer flex-col gap-2 p-3.5 text-left text-tx hover:border-pri ${CARD}`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <b className="text-[14px]/[20px] font-extrabold">{g.title}</b>
                  <b className="font-fredoka text-[18px]/none font-semibold" style={{ color: objInk(g.colorIndex) }}>{g.progressPct}%</b>
                </span>
                <span className="h-2.5 overflow-hidden rounded-full bg-s2">
                  <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${g.progressPct}%`, background: objColor(g.colorIndex) }} />
                </span>
                <span className="flex items-center gap-1.5 text-[12px]/[16px] font-semibold text-tx2">
                  <i className={`ph-bold ${late ? "ph-warning-circle text-danger" : "ph-check-circle text-pri"} text-[14px]`} />
                  {goalMeta(g)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={KICKER}>Conquistas recentes</span>
            <button type="button" className={TERTIARY}>Ver jardim</button>
          </div>
          {RECENT_BADGES.map((b) => {
            const st = BADGE_STYLE[b.state];
            return (
              <div key={b.name} className="flex items-center gap-3.5">
                <span className={`box-border flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 ${st.box} ${st.icon}`}>
                  <i className={`${b.icon} text-[26px]`} />
                </span>
                <span className="flex flex-col">
                  <b className={`font-fredoka text-[16px]/[20px] font-semibold ${st.name}`}>{b.name}</b>
                  <span className={`text-[12px]/[16px] font-semibold ${st.sub}`}>{b.sub}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {activeRamp && (
        <RampModal
          target={activeRamp}
          energy={energy}
          onToast={showToast}
          onRecorded={() => setReloadKey((k) => k + 1)}
          onClose={(changed) => {
            setRamp(null);
            clearParams();
            if (changed) setReloadKey((k) => k + 1);
          }}
        />
      )}
      {novoOpen && (
        <NewGoalModal
          onClose={() => {
            setNovo(false);
            clearParams();
          }}
          onCreated={() => {
            setNovo(false);
            router.push("/calendario");
          }}
        />
      )}
      {toast && <Toast toast={toast} />}
    </div>
  );
}
