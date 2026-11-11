"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authRepository } from "@/modules/auth/data";
import ProgressRing from "@/modules/core/components/progress-ring.component";
import { CARD, KICKER, PRIMARY_BTN, objColor, objInk } from "@/modules/core/components/ui";
import { clock } from "@/modules/core/data/clock";
import { DEFAULT_TIMEZONE, addDays, dayOfMonth, formatDdMm, formatDuration, localDate, monthName, weekdayIndex, weekdayLong } from "@/modules/core/format/time.format";
import { goalsRepository, type GetGoalResponse, type GoalListItem } from "../data";
import { slackShort, stepView, type TrailState } from "../logic/trail.logic";

// W22 trilha do objetivo (AppObjetivos.dc.html, detalhe). "← Objetivos" volta para a lista (W21).
// Sem ação nesta etapa: "Editar trilha" (W23), fora da fatia.
const DOT: Record<TrailState, { box: string; icon: string }> = {
  done: { box: "border-solid border-pri-soft bg-pri-soft text-pri", icon: "ph-bold ph-check" },
  next: { box: "border-solid border-pri bg-pri text-pri-tx", icon: "ph-fill ph-play" },
  partial: { box: "border-dashed border-border bg-surface text-tx2", icon: "ph-bold ph-circle-half" },
  pending: { box: "border-dashed border-border bg-surface text-tx2", icon: "ph ph-clock" },
};

const TERTIARY = "flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-3 text-[14px]/none font-extrabold text-blue hover:bg-blue-soft";

export default function GoalTrailPage({ goalId }: { goalId: string }) {
  const router = useRouter();
  const now = clock.now();
  const [tz, setTz] = useState(DEFAULT_TIMEZONE);
  const [data, setData] = useState<GetGoalResponse | null>(null);
  const [item, setItem] = useState<GoalListItem | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    (async () => {
      const { user } = await authRepository.me();
      setTz(user.timezone);
      try {
        const [g, list] = await Promise.all([goalsRepository.get(goalId), goalsRepository.list()]);
        setData(g);
        setItem(list.goals.find((x) => x.id === goalId) ?? null);
      } catch {
        setMissing(true);
      }
    })();
  }, [goalId]);

  if (missing) return <p className="px-12 pt-10 text-[18px]/[28px] text-tx2">Objetivo não encontrado</p>;
  if (!data) return null;

  const { goal, steps } = data;
  const today = localDate(now, tz);
  const color = objColor(goal.colorIndex);
  const firstPending = steps.find((s) => s.status !== "done");
  const next = firstPending?.nextBlock ? firstPending : steps.find((s) => s.status !== "done" && s.nextBlock);
  const deadlineLabel = goal.deadline ? formatDdMm(goal.deadline) : "sem prazo";
  const kindLabel = goal.deadline ? `Entrega · ${deadlineLabel}` : "Sem prazo";
  const totalMinutes = steps.reduce((a, s) => a + s.estimatedMinutes, 0);
  const blockDays = new Set(steps.filter((s) => s.nextBlock).map((s) => localDate(s.nextBlock!.start, tz)));
  const monday = addDays(today, -weekdayIndex(today));
  const mini = Array.from({ length: 35 }, (_, i) => addDays(monday, i - 14));

  return (
    <div className="box-border max-w-[1200px] px-12 pt-10 pb-16">
      <button type="button" onClick={() => router.push("/objetivos")} className={`-ml-3 ${TERTIARY}`}>
        <i className="ph-bold ph-arrow-left text-[16px]" />Objetivos
      </button>
      <div className="mt-3 flex items-end justify-between gap-6">
        <div>
          <span className={`flex items-center gap-2 ${KICKER}`}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {kindLabel}
          </span>
          <h1 className="mt-1.5 mb-0 font-fredoka text-[40px]/[48px] font-semibold">{goal.title}</h1>
        </div>
        {next?.nextBlock && (
          <button
            type="button"
            onClick={() => router.push(`/hoje?goal=${goal.id}&step=${next.id}&block=${next.nextBlock!.id}`)}
            className={`${PRIMARY_BTN} !gap-2 !px-6`}
          >
            <i className="ph-fill ph-play text-[16px]" />Começar próxima etapa
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-[360px_minmax(0,1fr)] items-start gap-8">
        <div className="flex flex-col gap-6">
          <div className={`flex flex-col items-center gap-4 p-6 ${CARD}`}>
            <div className="relative h-[180px] w-[180px]">
              <ProgressRing size={180} fraction={data.progressPct / 100} color={color} track="var(--s2)" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <b className="font-fredoka text-[44px]/none font-semibold" style={{ color: objInk(goal.colorIndex) }}>{data.progressPct}%</b>
                <span className="mt-1.5 text-[12px]/[16px] font-bold text-tx2">{data.done} de {data.total} etapas</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 self-stretch">
              <div className="rounded-[12px] border border-border bg-bg p-3">
                <span className={KICKER}>Prazo</span>
                <b className="mt-1 block font-fredoka text-[20px]/[26px] font-semibold">{deadlineLabel}</b>
                <span className="text-[12px]/[16px] font-semibold text-tx2">{goal.deadline ? weekdayLong(goal.deadline) : ""}</span>
              </div>
              <div className="rounded-[12px] border border-border bg-bg p-3">
                <span className={KICKER}>Folga</span>
                <b className={`mt-1 block font-fredoka text-[20px]/[26px] font-semibold ${item?.slackDays != null && item.slackDays < 0 ? "text-danger" : "text-tx"}`}>
                  {slackShort(item?.slackDays ?? null)}
                </b>
                <span className="text-[12px]/[16px] font-semibold text-tx2">{formatDuration(totalMinutes)} no total</span>
              </div>
            </div>
          </div>

          <div className={`flex flex-col gap-3 p-5 ${CARD}`}>
            <div className="flex items-center justify-between">
              <b className="font-fredoka text-[18px]/[24px] font-semibold capitalize">{monthName(today)}</b>
              <button type="button" onClick={() => router.push("/calendario")} className={`${TERTIARY} !px-2.5`}>Abrir calendário</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["S", "T", "Q", "Q", "S", "S", "D"].map((h, i) => (
                <span key={i} className="text-[12px]/[16px] font-extrabold text-tx2">{h}</span>
              ))}
              {mini.map((d) => {
                const isToday = d === today;
                const isDeadline = d === goal.deadline;
                return (
                  <span
                    key={d}
                    title={isDeadline ? `Entrega ${deadlineLabel}` : ""}
                    className={`box-border flex h-10 flex-col items-center justify-center gap-0.5 rounded-[10px] border-2 ${isToday ? "bg-pri" : "bg-transparent"}`}
                    style={{ borderColor: isDeadline ? color : "transparent", opacity: d.slice(5, 7) !== today.slice(5, 7) ? 0.45 : 1 }}
                  >
                    <b className={`font-fredoka text-[14px]/none font-semibold ${isToday ? "text-pri-tx" : "text-tx"}`}>{dayOfMonth(d)}</b>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: blockDays.has(d) ? color : "transparent" }} />
                  </span>
                );
              })}
            </div>
            <div className="flex gap-3.5 text-[12px]/[16px] font-bold text-tx2">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />Etapa agendada</span>
              <span className="flex items-center gap-1.5"><span className="box-border h-3 w-3 rounded-[4px] border-2" style={{ borderColor: color }} />Prazo</span>
            </div>
          </div>
        </div>

        <div className={`p-6 ${CARD}`}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="m-0 font-fredoka text-[28px]/[36px] font-semibold">Trilha das etapas</h2>
            <span className="flex items-center gap-3">
              <span className="text-[14px]/[20px] font-bold whitespace-nowrap text-tx2">{data.done}/{data.total} concluídas</span>
              <button type="button" className="flex h-9 flex-none cursor-pointer items-center gap-1.5 rounded-full border-2 border-border bg-surface px-3.5 text-[14px]/none font-extrabold whitespace-nowrap text-blue shadow-[0_2px_0_var(--border)] active:translate-y-0.5 active:bg-s2 active:shadow-none">
                <i className="ph-bold ph-pencil-simple text-[16px]" />Editar trilha
              </button>
            </span>
          </div>
          <div className="mt-5 flex flex-col">
            {steps.map((s) => {
              const v = stepView(s, s.id === firstPending?.id, today, tz);
              const dot = DOT[v.state];
              return (
                <div key={s.id} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4">
                  <span className="relative flex justify-center">
                    <span className={`absolute top-0 bottom-0 w-0.5 ${v.state === "done" ? "bg-fill" : "bg-border"}`} />
                    <span className={`relative mt-3.5 box-border flex h-8 w-8 items-center justify-center rounded-full border-2 ${dot.box}`}>
                      <i className={`${dot.icon} text-[14px]`} />
                    </span>
                  </span>
                  <div className="flex items-start justify-between gap-4 pt-3 pb-5">
                    <div className="flex min-w-0 flex-col gap-1">
                      <b className={`font-fredoka text-[18px]/[24px] font-semibold ${v.state === "done" ? "text-tx2" : "text-tx"}`}>{s.title}</b>
                      <span className="text-[14px]/[20px] font-semibold text-tx2">{v.meta}</span>
                      {v.state === "partial" && (
                        <span className="mt-1 h-1.5 w-[200px] overflow-hidden rounded-full bg-s2">
                          <span className="block h-full bg-fill" style={{ width: `${v.partialPct}%` }} />
                        </span>
                      )}
                    </div>
                    {v.pill && (
                      <span className={`flex-none rounded-full px-[9px] py-[3px] text-[12px]/[16px] font-extrabold ${v.state === "next" ? "bg-pri text-pri-tx" : "bg-blue-soft text-blue"}`}>{v.pill}</span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-4">
              <span className="flex justify-center">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-s2 text-tx2">
                  <i className="ph-fill ph-flag-checkered text-[16px]" />
                </span>
              </span>
              <div className="pt-1.5 text-[15px]/[20px] font-bold">{goal.deadline ? `Entrega · ${deadlineLabel}` : "Sem prazo"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
