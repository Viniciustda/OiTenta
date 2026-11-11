import { KICKER, objColor } from "@/modules/core/components/ui";
import { dayOfMonth, weekdayShort } from "@/modules/core/format/time.format";
import { DEADLINE_KIND, dayAriaLabel, deadlineCountLabel } from "../logic/calendar.logic";

// Calendário em Prazos, Dia e Semana (W17): só o objetivo inteiro, na data do prazo final.
export interface DeadlineItem {
  id: string;
  title: string;
  colorIndex: number;
  progressPct: number;
}

interface CalendarDeadlineGridProps {
  /** canOpen: o cabeçalho abre o Dia só dentro do horizonte de navegação. */
  columns: { date: string; canOpen: boolean; items: DeadlineItem[] }[];
  today: string;
  selectedId: string | null;
  emptyLabel: string;
  onSelect: (goalId: string) => void;
  onOpenDay: (date: string) => void;
}

export const deadlineTip = (g: DeadlineItem) => `${DEADLINE_KIND} · ${g.title} · ${g.progressPct}%`;

export default function CalendarDeadlineGrid({ columns, today, selectedId, emptyLabel, onSelect, onOpenDay }: CalendarDeadlineGridProps) {
  const n = columns.length;
  const empty = !columns.some((c) => c.items.length);
  return (
    <>
      <div className="grid border-b border-border" style={{ gridTemplateColumns: `56px repeat(${n}, minmax(0,1fr))` }}>
        <span />
        {columns.map(({ date, canOpen, items }) => (
          <button key={date} type="button" aria-label={dayAriaLabel(date)} disabled={!canOpen} onClick={() => onOpenDay(date)} className="flex cursor-pointer flex-col disabled:cursor-default items-center gap-1 border-l border-border bg-transparent px-1 py-2.5 text-tx">
            <span className={KICKER}>{weekdayShort(date)}</span>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full font-fredoka text-[20px]/none font-semibold ${date === today ? "bg-pri text-pri-tx" : "text-tx"}`}>{dayOfMonth(date)}</span>
            <span className="text-[12px]/[16px] font-semibold text-tx2">{deadlineCountLabel(items.length)}</span>
          </button>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: `56px repeat(${n}, minmax(0,1fr))`, minHeight: n > 1 ? 320 : 240 }}>
        <div className="flex justify-center pt-4 text-tx2"><i className="ph-bold ph-flag-checkered text-[20px]" /></div>
        {columns.map(({ date, items }) => (
          <div key={date} role="group" aria-label={dayAriaLabel(date)} className={`flex flex-col gap-2 border-l border-border px-1.5 py-3 ${date === today ? "bg-bg" : ""}`}>
            {items.map((g) => (
              <button
                key={g.id}
                type="button"
                title={deadlineTip(g)}
                onClick={() => onSelect(g.id)}
                className="box-border flex w-full min-w-0 animate-[popIn_.4s_cubic-bezier(.3,1.6,.5,1)_both] cursor-pointer flex-col gap-1.5 overflow-hidden rounded-[12px] p-2.5 text-left text-tx"
                style={{
                  background: objColor(g.colorIndex),
                  border: "1px solid color-mix(in srgb, var(--tx) 8%, transparent)",
                  outline: selectedId === g.id ? "2px solid var(--tx)" : "none",
                  outlineOffset: 1,
                }}
              >
                <span className="flex items-center gap-1.5 text-[12px]/[16px] font-extrabold"><i className="ph-fill ph-flag-checkered text-[14px]" />{DEADLINE_KIND}</span>
                <b className="font-fredoka text-[16px]/[20px] font-semibold text-balance break-words hyphens-auto">{g.title}</b>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--tx)_15%,transparent)]">
                    <span className="block h-full rounded-full bg-tx" style={{ width: `${g.progressPct}%` }} />
                  </span>
                  <b className="font-fredoka text-[14px]/none font-semibold">{g.progressPct}%</b>
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
      {empty && (
        <div className="flex items-center justify-center gap-2 border-t border-border p-4 text-[14px]/[20px] font-bold text-tx2">
          <i className="ph-bold ph-flag-checkered text-[16px]" />
          {emptyLabel}
        </div>
      )}
    </>
  );
}
