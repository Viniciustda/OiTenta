import { objColor } from "@/modules/core/components/ui";
import { dayOfMonth } from "@/modules/core/format/time.format";
import type { PlanBlock } from "../data";
import { DEADLINE_KIND, type CalendarMode, dayAriaLabel, monthCellSummary } from "../logic/calendar.logic";
import { type DeadlineItem, deadlineTip } from "./calendar-deadline-grid.component";

// Calendário do mês (W18 Prazos, W19 Execução): 6 semanas a partir da segunda da semana do dia 1.
// Execução: carga do dia, prazos como marcadores, até 3 etapas e "+N". Prazos: só os objetivos na data do prazo.
const HEADS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export interface MonthCell {
  date: string;
  opacity: number;
  /** Abre a visão Dia (só dentro do horizonte do plano). */
  canOpen: boolean;
  blocks: PlanBlock[];
  deadlines: DeadlineItem[];
}

interface CalendarMonthProps {
  cells: MonthCell[];
  mode: CalendarMode;
  today: string;
  selectedId: string | null;
  onOpenDay: (date: string) => void;
  onSelectDeadline: (goalId: string) => void;
}

export default function CalendarMonth({ cells, mode, today, selectedId, onOpenDay, onSelectDeadline }: CalendarMonthProps) {
  const prazos = mode === "prazos";
  return (
    <>
      <div className="grid grid-cols-7 border-b border-border">
        {HEADS.map((h) => (
          <span key={h} className="p-3 text-[12px]/[16px] font-extrabold tracking-[.06em] text-tx2 uppercase">{h}</span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          const isToday = c.date === today;
          const summary = monthCellSummary(c.blocks);
          return (
            <div
              key={c.date}
              role="group"
              aria-label={dayAriaLabel(c.date)}
              onClick={() => c.canOpen && onOpenDay(c.date)}
              className={`flex min-h-[124px] min-w-0 flex-col gap-1 border-t border-border p-2 text-left text-tx ${i % 7 ? "border-l" : ""} ${isToday ? "bg-bg" : "bg-surface"} ${c.canOpen ? "cursor-pointer" : "cursor-default"}`}
              style={{ opacity: c.opacity }}
            >
              <span className="flex items-center justify-between">
                {c.canOpen ? (
                  // Botão para o teclado; o clique na célula inteira (mouse) faz o mesmo.
                  <button
                    type="button"
                    aria-label={dayAriaLabel(c.date)}
                    onClick={(e) => { e.stopPropagation(); onOpenDay(c.date); }}
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full font-fredoka text-[15px]/none font-semibold ${isToday ? "bg-pri text-pri-tx" : "bg-transparent text-tx"}`}
                  >
                    {dayOfMonth(c.date)}
                  </button>
                ) : (
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full font-fredoka text-[15px]/none font-semibold ${isToday ? "bg-pri text-pri-tx" : "text-tx"}`}>{dayOfMonth(c.date)}</span>
                )}
                {!prazos && <span className="text-[12px]/[16px] font-semibold text-tx2">{summary.load}</span>}
              </span>
              {prazos
                ? c.deadlines.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      title={deadlineTip(g)}
                      onClick={(e) => { e.stopPropagation(); onSelectDeadline(g.id); }}
                      className="flex min-w-0 cursor-pointer items-center gap-1 overflow-hidden rounded-[8px] px-1.5 py-1 text-[12px]/[16px] font-extrabold text-tx"
                      style={{ background: objColor(g.colorIndex), outline: selectedId === g.id ? "2px solid var(--tx)" : "none", outlineOffset: 1 }}
                    >
                      <i className="ph-fill ph-flag-checkered flex-none text-[12px]" />
                      <span className="min-w-0 flex-1 overflow-hidden text-left text-ellipsis whitespace-nowrap">{g.title}</span>
                      <b className="font-fredoka text-[13px]/none font-semibold">{g.progressPct}%</b>
                    </button>
                  ))
                : (
                  <>
                    {c.deadlines.map((g) => (
                      <span key={g.id} className="flex items-center gap-1 text-[12px]/[16px] font-extrabold text-tx">
                        <i className="ph-fill ph-flag-checkered text-[12px]" style={{ color: objColor(g.colorIndex) }} />
                        {DEADLINE_KIND} · {g.title}
                      </span>
                    ))}
                    {summary.bars.map((b) => (
                      <span
                        key={b.id}
                        className="block overflow-hidden rounded-[6px] px-1.5 py-0.5 text-[12px]/[16px] font-bold text-ellipsis whitespace-nowrap text-tx"
                        style={{ background: b.status === "done" ? "var(--s2)" : objColor(b.colorIndex) }}
                      >
                        {b.stepTitle}
                      </span>
                    ))}
                    {summary.more > 0 && <span className="text-[12px]/[16px] font-bold text-tx2">+{summary.more}</span>}
                  </>
                )}
            </div>
          );
        })}
      </div>
    </>
  );
}
