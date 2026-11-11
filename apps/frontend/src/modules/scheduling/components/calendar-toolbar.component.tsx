import { ICON_BTN, KICKER } from "@/modules/core/components/ui";
import type { CalendarMode, CalendarView } from "../logic/calendar.logic";

// Cabeçalho do calendário (AppCalendario.dc.html): período, setas, "Hoje", Dia/Semana/Mês e Execução/Prazos.
interface CalendarToolbarProps {
  rangeLabel: string;
  view: CalendarView;
  mode: CalendarMode;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onView: (v: CalendarView) => void;
  onMode: (m: CalendarMode) => void;
}

const VIEWS: [CalendarView, string][] = [["dia", "Dia"], ["semana", "Semana"], ["mes", "Mês"]];
const MODES: [CalendarMode, string, string][] = [["exec", "Execução", "puzzle-piece"], ["prazos", "Prazos", "flag-checkered"]];

const pill = (on: boolean) =>
  `h-9 cursor-pointer rounded-full border text-[14px]/none text-tx ${on ? "border-border bg-surface font-extrabold" : "border-transparent bg-transparent font-bold"}`;

export default function CalendarToolbar(p: CalendarToolbarProps) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <span className={KICKER}>{p.rangeLabel}</span>
        <h1 className="mt-1.5 mb-0 font-fredoka text-[40px]/[48px] font-semibold">Calendário</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Anterior" disabled={!p.canPrev} onClick={p.onPrev} className={`${ICON_BTN} disabled:cursor-default disabled:hover:bg-transparent ${p.canPrev ? "!text-tx" : "!text-border"}`}>
            <i className="ph-bold ph-caret-left text-[18px]" />
          </button>
          <button type="button" onClick={p.onToday} className="h-9 cursor-pointer rounded-full border-2 border-border bg-surface px-3.5 text-[14px]/none font-extrabold text-blue">Hoje</button>
          <button type="button" aria-label="Próximo" disabled={!p.canNext} onClick={p.onNext} className={`${ICON_BTN} disabled:cursor-default disabled:hover:bg-transparent ${p.canNext ? "!text-tx" : "!text-border"}`}>
            <i className="ph-bold ph-caret-right text-[18px]" />
          </button>
        </div>
        <div className="flex gap-0.5 rounded-full bg-s2 p-1">
          {VIEWS.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={p.view === id} onClick={() => p.onView(id)} className={`${pill(p.view === id)} px-[18px]`}>{label}</button>
          ))}
        </div>
        <div role="tablist" aria-label="Modo do calendário" className="flex gap-0.5 rounded-full bg-s2 p-1">
          {MODES.map(([id, label, icon]) => {
            const on = p.mode === id;
            return (
              <button key={id} type="button" role="tab" aria-selected={on} onClick={() => p.onMode(id)} className={`${pill(on)} flex items-center gap-1.5 pr-4 pl-3`}>
                <i className={`${on ? "ph-fill" : "ph-bold"} ph-${icon} text-[16px] ${on ? "text-pri" : "text-tx2"}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
