import { objColor, objInk } from "@/modules/core/components/ui";
import { type CalendarMode, FREE_BG } from "../logic/calendar.logic";

// Filtros por objetivo e legenda (AppCalendario.dc.html). A dica muda com o modo: arrastar blocos × clicar num prazo.

interface FilterGoal {
  id: string;
  title: string;
  colorIndex: number;
  progressPct: number;
}

interface CalendarFiltersProps {
  goals: FilterGoal[];
  hidden: Record<string, boolean>;
  mode: CalendarMode;
  onToggle: (goalId: string) => void;
}

export default function CalendarFilters({ goals, hidden, mode, onToggle }: CalendarFiltersProps) {
  const prazos = mode === "prazos";
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {goals.map((g) => {
          const on = !hidden[g.id];
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(g.id)}
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
        <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[4px] border border-border bg-[repeating-linear-gradient(135deg,var(--hatch)_0_2px,transparent_2px_6px)]" />Ocupado</span>
        <span className="flex items-center gap-1.5">
          <i className={`ph-bold ${prazos ? "ph-hand-pointing" : "ph-hand-grabbing"} text-[14px]`} />
          {prazos ? "Clique num prazo" : "Arraste os blocos"}
        </span>
      </div>
    </div>
  );
}
