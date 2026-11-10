"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authRepository } from "@/modules/auth/data";
import { ICON_BTN, KICKER, PRIMARY_BTN, SECONDARY_BTN, objColor, objInk } from "@/modules/core/components/ui";
import { clock } from "@/modules/core/data/clock";
import { DEFAULT_TIMEZONE, addDays, dayOfMonth, formatHm, localDate, localMinute, weekdayIndex, weekdayShort } from "@/modules/core/format/time.format";
import { goalsRepository, type GoalListItem } from "@/modules/goals/data";
import { goalMeta } from "@/modules/today/logic/today.logic";
import { schedulingRepository, type DayPlan, type PlanBlock, type WeeklyAvailability } from "../data";
import { FIRST_MINUTE, GRID_HOURS_COUNT, HOUR_HEIGHT, blockDetail, blockGeometry, dayLoadLabel, freeRects, weekRangeLabel } from "../logic/calendar.logic";

// W15 calendário semana (Execução) e W16 detalhe do bloco, só leitura (AppCalendario.dc.html).
// Fora da fatia e sem ação: navegação entre semanas, Dia/Mês, Prazos, arrastar, Mover, Marcar parcial,
// Não vou conseguir. Sem faixas de ocupado: não há compromissos no MVP (P8).
const FREE_BG = "color-mix(in srgb, var(--fill) 13%, transparent)";
const BLOCK_BORDER = "1px solid color-mix(in srgb, var(--tx) 8%, transparent)";
const BODY_H = HOUR_HEIGHT * GRID_HOURS_COUNT;

export default function CalendarPage() {
  const router = useRouter();
  const now = clock.now();
  const [tz, setTz] = useState(DEFAULT_TIMEZONE);
  const [days, setDays] = useState<DayPlan[] | null>(null);
  const [availability, setAvailability] = useState<WeeklyAvailability | null>(null);
  const [goals, setGoals] = useState<GoalListItem[]>([]);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { user } = await authRepository.me();
      setTz(user.timezone);
      const today = localDate(now, user.timezone);
      const monday = addDays(today, -weekdayIndex(today));
      const [week, av, list] = await Promise.all([
        schedulingRepository.getWeekPlan(monday),
        schedulingRepository.getAvailability().catch(() => null),
        goalsRepository.list(),
      ]);
      setDays(week.days);
      setAvailability(av?.availability ?? null);
      setGoals(list.goals);
    })();
  }, [now]);

  if (!days) return null;

  const today = localDate(now, tz);
  const n = days.length;
  const allBlocks = days.flatMap((d) => d.blocks);
  const selB = allBlocks.find((b) => b.id === sel) ?? null;
  const selGoal = selB ? goals.find((g) => g.id === selB.goalId) : undefined;
  const partsOf = (b: PlanBlock) => allBlocks.filter((x) => x.stepId === b.stepId && x.status !== "done");
  const nowCol = days.findIndex((d) => d.date === today);
  const nowTop = ((localMinute(now, tz) - FIRST_MINUTE) / 60) * HOUR_HEIGHT;

  const pill = (on: boolean) => `h-9 cursor-pointer rounded-full border text-[14px]/none text-tx ${on ? "border-border bg-surface font-extrabold" : "border-transparent bg-transparent font-bold"}`;

  return (
    <div className="box-border flex flex-col gap-5 px-8 pt-8 pb-12">
      <div className="flex items-end justify-between gap-6">
        <div>
          <span className={KICKER}>{weekRangeLabel(days[0].date)}</span>
          <h1 className="mt-1.5 mb-0 font-fredoka text-[40px]/[48px] font-semibold">Calendário</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Anterior" className={`${ICON_BTN} !text-border`}><i className="ph-bold ph-caret-left text-[18px]" /></button>
            <button type="button" className="h-9 cursor-pointer rounded-full border-2 border-border bg-surface px-3.5 text-[14px]/none font-extrabold text-blue">Hoje</button>
            <button type="button" aria-label="Próximo" className={`${ICON_BTN} !text-tx`}><i className="ph-bold ph-caret-right text-[18px]" /></button>
          </div>
          <div className="flex gap-0.5 rounded-full bg-s2 p-1">
            {["Dia", "Semana", "Mês"].map((v) => (
              <button key={v} type="button" className={`${pill(v === "Semana")} px-[18px]`}>{v}</button>
            ))}
          </div>
          <div role="tablist" aria-label="Modo do calendário" className="flex gap-0.5 rounded-full bg-s2 p-1">
            {[["Execução", "puzzle-piece"], ["Prazos", "flag-checkered"]].map(([label, icon]) => {
              const on = label === "Execução";
              return (
                <button key={label} type="button" role="tab" aria-selected={on} className={`${pill(on)} flex items-center gap-1.5 pr-4 pl-3`}>
                  <i className={`${on ? "ph-fill" : "ph-bold"} ph-${icon} text-[16px] ${on ? "text-pri" : "text-tx2"}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {goals.map((g) => {
            const on = !hidden[g.id];
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => setHidden((h) => ({ ...h, [g.id]: !h[g.id] }))}
                className={`flex h-9 cursor-pointer items-center gap-2 rounded-full border-2 px-3 text-[13px]/none font-extrabold ${on ? "border-pri bg-pri-soft text-tx" : "border-border bg-surface text-tx2"}`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: objColor(g.colorIndex), opacity: on ? 1 : 0.35 }} />
                {g.title}
                <b className="font-fredoka text-[14px]/none font-semibold" style={{ color: on ? objInk(g.colorIndex) : "var(--tx2)" }}>{g.progressPct}%</b>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 text-[12px]/[16px] font-bold text-tx2">
          <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[4px] border border-border" style={{ background: FREE_BG }} />Livre</span>
          <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[4px] border border-border bg-[repeating-linear-gradient(135deg,var(--border)_0_2px,transparent_2px_6px)]" />Ocupado</span>
          <span className="flex items-center gap-1.5"><i className="ph-bold ph-hand-grabbing text-[14px]" />Arraste os blocos</span>
        </div>
      </div>

      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1 overflow-hidden rounded-[16px] border border-border bg-surface shadow-card">
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `56px repeat(${n}, minmax(0,1fr))` }}>
            <span />
            {days.map((d) => {
              const isToday = d.date === today;
              return (
                <div key={d.date} className="flex flex-col items-center gap-1 border-l border-border px-1 py-2.5 text-tx">
                  <span className={KICKER}>{weekdayShort(d.date)}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full font-fredoka text-[20px]/none font-semibold ${isToday ? "bg-pri text-pri-tx" : "text-tx"}`}>{dayOfMonth(d.date)}</span>
                  <span className={`text-[12px]/[16px] font-semibold ${d.usedMinutes >= d.limitMinutes && d.usedMinutes ? "text-pri" : "text-tx2"}`}>{dayLoadLabel(d.usedMinutes, d.limitMinutes)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex">
            <div className="relative w-14 flex-none" style={{ height: BODY_H }}>
              {Array.from({ length: GRID_HOURS_COUNT }, (_, i) => (
                <span key={i} className="absolute right-2 -translate-y-1/2 text-[12px]/none font-semibold text-tx2" style={{ top: i * HOUR_HEIGHT + (i === 0 ? 8 : 0) }}>
                  {String(8 + i).padStart(2, "0")}h
                </span>
              ))}
            </div>
            <div className="relative min-w-0 flex-1" style={{ height: BODY_H }}>
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
                {days.map((d) => (
                  <div key={d.date} className="relative border-l border-border">
                    {availability &&
                      freeRects(availability.windows, weekdayIndex(d.date)).map((r) => (
                        <div key={r.top} className="absolute right-0 left-0" style={{ top: r.top, height: r.height, background: FREE_BG }} />
                      ))}
                    {d.date === today && <div className="absolute top-0 right-0 left-0 bg-bg opacity-55" style={{ height: Math.max(0, nowTop) }} />}
                  </div>
                ))}
              </div>
              {Array.from({ length: GRID_HOURS_COUNT - 1 }, (_, i) => (
                <div key={i} className="pointer-events-none absolute right-0 left-0 h-px bg-border opacity-60" style={{ top: (i + 1) * HOUR_HEIGHT }} />
              ))}
              {nowCol >= 0 && (
                <div className="pointer-events-none absolute z-[3] h-0.5 bg-blue-fill" style={{ top: nowTop, left: `calc(${nowCol} * 100% / ${n})`, width: `calc(100% / ${n})` }}>
                  <span className="absolute -top-1 -left-[5px] h-2.5 w-2.5 rounded-full bg-blue-fill" />
                </div>
              )}
              {days.map((d, col) =>
                d.blocks
                  .filter((b) => !hidden[b.goalId])
                  .map((b) => {
                    const { top, height } = blockGeometry(b.start, b.end, tz);
                    const small = height < 40;
                    const done = b.status === "done";
                    const time = `${formatHm(b.start, tz)}–${formatHm(b.end, tz)}`;
                    const icon = done ? "ph-check" : partsOf(b).length > 1 ? "ph-puzzle-piece" : "ph-dot-outline";
                    return (
                      <button
                        key={b.id}
                        type="button"
                        title={`${b.goalTitle} · ${b.stepTitle} · ${time}`}
                        onClick={() => setSel(b.id)}
                        className={`absolute box-border flex cursor-pointer flex-col gap-0.5 overflow-hidden rounded-[8px] text-left ${done ? "text-tx2" : "text-tx"}`}
                        style={{
                          left: `calc(${col} * 100% / ${n} + 3px)`,
                          width: `calc(100% / ${n} - 6px)`,
                          top,
                          height,
                          padding: small ? "2px 8px" : "6px 8px",
                          background: done ? "var(--s2)" : objColor(b.colorIndex),
                          border: done ? "1px solid var(--border)" : BLOCK_BORDER,
                          outline: sel === b.id ? "2px solid var(--tx)" : "none",
                          outlineOffset: 1,
                          zIndex: sel === b.id ? 6 : 5,
                        }}
                      >
                        <span className={`flex items-center gap-1 overflow-hidden text-[12px]/[16px] font-extrabold text-ellipsis whitespace-nowrap ${done ? "line-through" : ""}`}>
                          <i className={`ph-bold ${icon} flex-none text-[12px]`} />
                          <span className="overflow-hidden text-ellipsis">{b.stepTitle}</span>
                        </span>
                        {!small && <span className="text-[12px]/[16px] font-semibold opacity-80">{time}</span>}
                      </button>
                    );
                  }),
              )}
            </div>
          </div>
        </div>

        {selB && (
          <aside className="sticky top-6 box-border flex w-[360px] flex-none flex-col gap-4 rounded-[16px] border border-border bg-surface p-5 shadow-[0_8px_24px_color-mix(in_srgb,var(--tx)_10%,transparent)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[13px]/[16px] font-bold text-tx2">
                <span className="h-2 w-2 rounded-full" style={{ background: objColor(selB.colorIndex) }} />
                {selB.goalTitle}
              </span>
              <button type="button" aria-label="Fechar" onClick={() => setSel(null)} className={`${ICON_BTN} -my-2.5 -mr-2.5`}>
                <i className="ph ph-x text-[22px]" />
              </button>
            </div>
            <div>
              <h2 className="m-0 font-fredoka text-[28px]/[36px] font-semibold text-balance">{selB.stepTitle}</h2>
              <span className="mt-1 block text-[14px]/[20px] font-semibold text-tx2">
                {(() => {
                  const parts = partsOf(selB);
                  if (selB.status === "done") return "Concluída";
                  return parts.length > 1 ? `Parte ${parts.findIndex((p) => p.id === selB.id) + 1} de ${parts.length} desta etapa` : "Etapa inteira";
                })()}
              </span>
            </div>
            <div className="flex flex-col gap-2 text-[14px]/[20px] font-bold">
              <span className="flex items-center gap-2"><i className="ph ph-calendar-blank text-[20px] text-tx2" />{blockDetail(selB, today, tz).when}</span>
              <span className="flex items-center gap-2"><i className="ph ph-clock text-[20px] text-tx2" />{blockDetail(selB, today, tz).duration}</span>
              <span className="flex items-center gap-2"><i className="ph-fill ph-drop text-[20px] text-blue-fill" />+20 gotas ao concluir</span>
            </div>
            {selGoal && (
              <div className="flex flex-col gap-2 rounded-[16px] border border-border bg-bg p-3.5">
                <span className="flex items-baseline justify-between">
                  <b className="text-[14px]/[20px] font-extrabold">{selGoal.title}</b>
                  <b className="font-fredoka text-[18px]/none font-semibold" style={{ color: objInk(selGoal.colorIndex) }}>{selGoal.progressPct}%</b>
                </span>
                <span className="h-2.5 overflow-hidden rounded-full bg-s2">
                  <span className="block h-full rounded-full" style={{ width: `${selGoal.progressPct}%`, background: objColor(selGoal.colorIndex) }} />
                </span>
                <span className="flex items-center gap-1.5 text-[12px]/[16px] font-semibold text-tx2">
                  <i className="ph-bold ph-check-circle text-[14px] text-pri" />
                  {goalMeta(selGoal)}
                </span>
              </div>
            )}
            {selB.status === "done" ? (
              <span className="flex items-center gap-2 rounded-[16px] bg-pri-soft px-3.5 py-3 text-[15px]/[20px] font-extrabold text-pri">
                <i className="ph-bold ph-check text-[16px]" />Etapa concluída
              </span>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/hoje?goal=${selB.goalId}&step=${selB.stepId}&block=${selB.id}`)}
                  className={PRIMARY_BTN}
                >
                  <i className="ph-fill ph-play text-[18px]" />Começar agora
                </button>
                <button type="button" className={SECONDARY_BTN}>
                  <i className="ph-bold ph-arrows-out-cardinal text-[18px]" />Mover
                </button>
                <div className="flex gap-1">
                  <button type="button" className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-transparent text-[15px]/none font-extrabold text-blue hover:bg-blue-soft">
                    <i className="ph-bold ph-circle-half text-[16px]" />Marcar parcial
                  </button>
                  <button type="button" className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-transparent text-[15px]/none font-extrabold text-blue hover:bg-blue-soft">
                    <i className="ph-bold ph-calendar-x text-[16px]" />Não vou conseguir
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
