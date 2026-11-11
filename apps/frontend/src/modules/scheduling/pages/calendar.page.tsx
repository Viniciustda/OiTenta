"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authRepository } from "@/modules/auth/data";
import { clock } from "@/modules/core/data/clock";
import { DEFAULT_TIMEZONE, localDate } from "@/modules/core/format/time.format";
import { goalsRepository, type GoalListItem, type GoalStepDetail } from "@/modules/goals/data";
import BlockDetailPanel from "../components/block-detail-panel.component";
import CalendarDeadlineGrid from "../components/calendar-deadline-grid.component";
import CalendarFilters from "../components/calendar-filters.component";
import CalendarMonth from "../components/calendar-month.component";
import CalendarTimeGrid from "../components/calendar-time-grid.component";
import CalendarToolbar from "../components/calendar-toolbar.component";
import DeadlineDetailPanel from "../components/deadline-detail-panel.component";
import { schedulingRepository, type DayPlan, type PlanBlock, type WeeklyAvailability } from "../data";
import {
  type CalendarMode,
  type CalendarView,
  canNavigate,
  dayFromWeek,
  deadlineDetail,
  deadlinesOn,
  inHorizon,
  mondayOf,
  monthCellOpacity,
  prazosEmptyLabel,
  rangeLabel,
  shiftAnchor,
  verExecucaoWeek,
  viewDates,
  weekStarts,
} from "../logic/calendar.logic";

// W15–W20 calendário (AppCalendario.dc.html): Dia / Semana / Mês × Execução / Prazos, e os detalhes do bloco
// (W16) e do prazo. Execução mostra os blocos das etapas no tempo; Prazos, só o objetivo inteiro na data do
// prazo final. Dados: GET /scheduling/plan/day e /plan/week (o mês junta as semanas) e GET /goals.
// Fora desta fase e sem ação: arrastar, Mover, Marcar parcial, Não vou conseguir. Sem faixas de ocupado (P8).
export default function CalendarPage() {
  const router = useRouter();
  const now = clock.now();
  const [tz, setTz] = useState(DEFAULT_TIMEZONE);
  const [ready, setReady] = useState(false);
  const [plans, setPlans] = useState<Record<string, DayPlan>>({});
  const [availability, setAvailability] = useState<WeeklyAvailability | null>(null);
  const [goals, setGoals] = useState<GoalListItem[]>([]);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<CalendarView>("semana");
  const [mode, setMode] = useState<CalendarMode>("exec");
  const [weekStart, setWeekStart] = useState("");
  const [day, setDay] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [selGoalId, setSelGoalId] = useState<string | null>(null);
  const [selGoalSteps, setSelGoalSteps] = useState<GoalStepDetail[] | null>(null);

  const addPlans = (days: DayPlan[]) => setPlans((p) => ({ ...p, ...Object.fromEntries(days.map((d) => [d.date, d])) }));

  useEffect(() => {
    (async () => {
      const { user } = await authRepository.me();
      setTz(user.timezone);
      const today = localDate(now, user.timezone);
      const monday = mondayOf(today);
      const [week, av, list] = await Promise.all([
        schedulingRepository.getWeekPlan(monday),
        schedulingRepository.getAvailability().catch(() => null),
        goalsRepository.list(),
      ]);
      addPlans(week.days);
      setAvailability(av?.availability ?? null);
      setGoals(list.goals);
      // O relógio real muda a cada minuto e reexecuta este efeito: só inicializa a navegação uma vez.
      setWeekStart((w) => w || monday);
      setDay((d) => d || today);
      setReady(true);
    })();
  }, [now]);

  const today = localDate(now, tz);
  const anchor = view === "dia" ? day : view === "semana" ? weekStart : today;
  const dates = ready ? viewDates(view, anchor) : [];
  const missing = dates.filter((d) => !plans[d]).join(",");

  // Carrega o plano que falta para a visualização: o dia, a semana ou as semanas que cobrem o mês.
  useEffect(() => {
    if (!missing) return;
    const need = missing.split(",");
    (async () => {
      if (view === "dia") addPlans([await schedulingRepository.getDayPlan(need[0])]);
      else (await Promise.all(weekStarts(need).map((m) => schedulingRepository.getWeekPlan(m)))).forEach((w) => addPlans(w.days));
    })();
  }, [missing, view]);

  // Detalhe do prazo: o tempo que falta e a próxima etapa vêm de GET /goals/:goalId.
  useEffect(() => {
    if (!selGoalId) return;
    let alive = true;
    goalsRepository.get(selGoalId).then((r) => alive && setSelGoalSteps(r.steps));
    return () => {
      alive = false;
      setSelGoalSteps(null);
    };
  }, [selGoalId]);

  if (!ready) return null;

  const columns = dates.map((date) => ({ date, plan: plans[date] }));
  const visibleBlocks = columns.flatMap((c) => c.plan?.blocks ?? []);
  // Partes da etapa entre todos os planos já carregados (o protótipo conta o plano inteiro), em ordem.
  const loadedBlocks = Object.values(plans).flatMap((p) => p.blocks).sort((a, b) => a.start.localeCompare(b.start));
  const selB = mode === "exec" ? (visibleBlocks.find((b) => b.id === sel) ?? null) : null;
  const partsOf = (b: PlanBlock) => loadedBlocks.filter((x) => x.stepId === b.stepId && x.status !== "done");
  const selGoal = mode === "prazos" ? goals.find((g) => g.id === selGoalId) : undefined;

  const pickMode = (m: CalendarMode) => {
    setMode(m);
    setSel(null);
    setSelGoalId(null);
  };
  const pickView = (v: CalendarView) => {
    if (v === "dia" && view === "semana") setDay(dayFromWeek(weekStart, today));
    setView(v);
  };
  const openDay = (date: string) => {
    setDay(date);
    setView("dia");
  };
  const move = (dir: -1 | 1) => {
    if (!canNavigate(view, anchor, today, dir)) return;
    if (view === "semana") setWeekStart(shiftAnchor("semana", weekStart, dir));
    else setDay(shiftAnchor("dia", day, dir));
  };
  const verExecucao = () => {
    if (!selGoal?.deadline) return;
    const next = (selGoalSteps ?? [])
      .filter((s) => s.status === "pending" && s.nextBlock)
      .map((s) => s.nextBlock!.start)
      .sort()[0];
    setHidden(Object.fromEntries(goals.filter((g) => g.id !== selGoal.id).map((g) => [g.id, true])));
    setWeekStart(verExecucaoWeek(next ?? null, selGoal.deadline, today, tz));
    setView("semana");
    pickMode("exec");
  };

  return (
    <div className="box-border flex flex-col gap-5 px-8 pt-8 pb-12">
      <CalendarToolbar
        rangeLabel={rangeLabel(view, anchor)}
        view={view}
        mode={mode}
        canPrev={canNavigate(view, anchor, today, -1)}
        canNext={canNavigate(view, anchor, today, 1)}
        onPrev={() => move(-1)}
        onNext={() => move(1)}
        onToday={() => {
          setWeekStart(mondayOf(today));
          setDay(today);
        }}
        onView={pickView}
        onMode={pickMode}
      />

      <CalendarFilters goals={goals} hidden={hidden} mode={mode} onToggle={(id) => setHidden((h) => ({ ...h, [id]: !h[id] }))} />

      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1 overflow-hidden rounded-[16px] border border-border bg-surface shadow-card">
          {view === "mes" ? (
            <CalendarMonth
              cells={columns.map(({ date, plan }) => ({
                date,
                opacity: monthCellOpacity(date, today, today),
                canOpen: inHorizon(date, today),
                blocks: (plan?.blocks ?? []).filter((b) => !hidden[b.goalId]),
                deadlines: deadlinesOn(goals, date, hidden),
              }))}
              mode={mode}
              today={today}
              selectedId={selGoalId}
              onOpenDay={openDay}
              onSelectDeadline={setSelGoalId}
            />
          ) : mode === "prazos" ? (
            <CalendarDeadlineGrid
              columns={dates.map((date) => ({ date, canOpen: inHorizon(date, today), items: deadlinesOn(goals, date, hidden) }))}
              today={today}
              selectedId={selGoalId}
              emptyLabel={prazosEmptyLabel(view, goals, dates[dates.length - 1], hidden)}
              onSelect={setSelGoalId}
              onOpenDay={openDay}
            />
          ) : (
            <CalendarTimeGrid
              columns={columns.map((c) => ({ ...c, canOpen: inHorizon(c.date, today) }))}
              today={today}
              now={now}
              tz={tz}
              availability={availability}
              hidden={hidden}
              selectedId={sel}
              partsOf={(b) => partsOf(b).length}
              onSelect={setSel}
              onOpenDay={openDay}
            />
          )}
        </div>

        {selB && (
          <BlockDetailPanel
            block={selB}
            goal={goals.find((g) => g.id === selB.goalId)}
            parts={partsOf(selB)}
            today={today}
            tz={tz}
            onClose={() => setSel(null)}
            onStart={() => router.push(`/hoje?goal=${selB.goalId}&step=${selB.stepId}&block=${selB.id}`)}
          />
        )}
        {selGoal?.deadline && selGoalSteps && (
          <DeadlineDetailPanel
            detail={{ ...selGoal, ...deadlineDetail(selGoal, selGoalSteps, today, tz) }}
            onClose={() => setSelGoalId(null)}
            onVerExecucao={verExecucao}
          />
        )}
      </div>
    </div>
  );
}
