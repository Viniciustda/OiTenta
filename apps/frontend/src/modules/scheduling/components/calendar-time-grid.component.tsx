import { KICKER, objColor } from "@/modules/core/components/ui";
import { dayOfMonth, formatHm, localMinute, weekdayIndex, weekdayShort } from "@/modules/core/format/time.format";
import type { DayPlan, PlanBlock, WeeklyAvailability } from "../data";
import { FIRST_MINUTE, GRID_HOURS_COUNT, HOUR_HEIGHT, blockGeometry, dayAriaLabel, dayLoadLabel, freeRects } from "../logic/calendar.logic";
import { FREE_BG } from "./calendar-filters.component";

// Grade de horas do calendário em Execução (W15 semana, W20 dia): blocos das etapas alocados no tempo.
// Sem faixas de ocupado: não há compromissos no MVP (P8). Sem arrastar (só leitura nesta fase).
const BLOCK_BORDER = "1px solid color-mix(in srgb, var(--tx) 8%, transparent)";
const BODY_H = HOUR_HEIGHT * GRID_HOURS_COUNT;

export interface CalendarColumn {
  date: string;
  /** Ausente enquanto o plano do dia carrega. */
  plan?: DayPlan;
}

interface CalendarTimeGridProps {
  columns: CalendarColumn[];
  today: string;
  now: string;
  tz: string;
  availability: WeeklyAvailability | null;
  hidden: Record<string, boolean>;
  selectedId: string | null;
  /** Quantas partes pendentes a etapa do bloco tem (ícone de quebra-cabeça). */
  partsOf: (b: PlanBlock) => number;
  onSelect: (blockId: string) => void;
  onOpenDay: (date: string) => void;
}

export default function CalendarTimeGrid({ columns, today, now, tz, availability, hidden, selectedId, partsOf, onSelect, onOpenDay }: CalendarTimeGridProps) {
  const n = columns.length;
  const nowCol = columns.findIndex((c) => c.date === today);
  const nowTop = ((localMinute(now, tz) - FIRST_MINUTE) / 60) * HOUR_HEIGHT;

  return (
    <>
      <div className="grid border-b border-border" style={{ gridTemplateColumns: `56px repeat(${n}, minmax(0,1fr))` }}>
        <span />
        {columns.map(({ date, plan }) => {
          const isToday = date === today;
          const used = plan?.usedMinutes ?? 0;
          const limit = plan?.limitMinutes ?? 0;
          return (
            <button key={date} type="button" aria-label={dayAriaLabel(date)} onClick={() => onOpenDay(date)} className="flex cursor-pointer flex-col items-center gap-1 border-l border-border bg-transparent px-1 py-2.5 text-tx">
              <span className={KICKER}>{weekdayShort(date)}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-full font-fredoka text-[20px]/none font-semibold ${isToday ? "bg-pri text-pri-tx" : "text-tx"}`}>{dayOfMonth(date)}</span>
              <span className={`text-[12px]/[16px] font-semibold ${used >= limit && used ? "text-pri" : "text-tx2"}`}>{plan ? dayLoadLabel(used, limit) : " "}</span>
            </button>
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
            {columns.map(({ date }) => (
              <div key={date} className="relative border-l border-border">
                {availability &&
                  freeRects(availability.windows, weekdayIndex(date)).map((r) => (
                    <div key={r.top} className="absolute right-0 left-0" style={{ top: r.top, height: r.height, background: FREE_BG }} />
                  ))}
                {date === today && <div className="absolute top-0 right-0 left-0 bg-bg opacity-55" style={{ height: Math.max(0, nowTop) }} />}
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
          {columns.map(({ plan }, col) =>
            (plan?.blocks ?? [])
              .filter((b) => !hidden[b.goalId])
              .map((b) => {
                const { top, height } = blockGeometry(b.start, b.end, tz);
                const small = height < 40;
                const done = b.status === "done";
                const time = `${formatHm(b.start, tz)}–${formatHm(b.end, tz)}`;
                const icon = done ? "ph-check" : partsOf(b) > 1 ? "ph-puzzle-piece" : "ph-dot-outline";
                const nowrap = small || n > 1;
                return (
                  <button
                    key={b.id}
                    type="button"
                    title={`${b.goalTitle} · ${b.stepTitle} · ${time}`}
                    onClick={() => onSelect(b.id)}
                    className={`absolute box-border flex cursor-pointer flex-col gap-0.5 overflow-hidden rounded-[8px] text-left ${done ? "text-tx2" : "text-tx"}`}
                    style={{
                      left: `calc(${col} * 100% / ${n} + 3px)`,
                      width: `calc(100% / ${n} - 6px)`,
                      top,
                      height,
                      padding: small ? "2px 8px" : "6px 8px",
                      background: done ? "var(--s2)" : objColor(b.colorIndex),
                      border: done ? "1px solid var(--border)" : BLOCK_BORDER,
                      outline: selectedId === b.id ? "2px solid var(--tx)" : "none",
                      outlineOffset: 1,
                      zIndex: selectedId === b.id ? 6 : 5,
                    }}
                  >
                    <span className={`flex items-center gap-1 overflow-hidden text-[12px]/[16px] font-extrabold text-ellipsis ${nowrap ? "whitespace-nowrap" : ""} ${done ? "line-through" : ""}`}>
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
    </>
  );
}
