"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authRepository } from "@/modules/auth/data";
import { KICKER, objColor, objInk } from "@/modules/core/components/ui";
import { clock } from "@/modules/core/data/clock";
import { localDate } from "@/modules/core/format/time.format";
import { goalsRepository, type GoalListItem, type GoalStepDetail } from "../data";
import { activeCountLabel, goalCardView } from "../logic/goal-list.logic";

// W21 Objetivos (AppObjetivos.dc.html, lista). A próxima etapa de cada objetivo vem de GET /goals/:goalId
// (nextBlock das etapas); GET /goals não traz esse dado.
interface Loaded {
  goals: GoalListItem[];
  steps: Record<string, GoalStepDetail[]>;
  today: string;
  tz: string;
}

export default function GoalListPage() {
  const router = useRouter();
  const now = clock.now();
  const [data, setData] = useState<Loaded | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ user }, { goals }] = await Promise.all([authRepository.me(), goalsRepository.list()]);
      const details = await Promise.all(goals.map((g) => goalsRepository.get(g.id).then((d) => d.steps, () => [])));
      if (!alive) return;
      setData({
        goals,
        steps: Object.fromEntries(goals.map((g, i) => [g.id, details[i]])),
        today: localDate(now, user.timezone),
        tz: user.timezone,
      });
    })();
    return () => {
      alive = false;
    };
  }, [now]);

  return (
    <div className="box-border max-w-[1200px] px-12 pt-10 pb-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <span className={KICKER}>{data ? activeCountLabel(data.goals) : ""}</span>
          <h1 className="mt-1.5 mb-0 font-fredoka text-[40px]/[48px] font-semibold">Objetivos</h1>
        </div>
        <button
          type="button"
          onClick={() => router.push("/hoje?novo=1")}
          className="flex h-[52px] cursor-pointer items-center gap-2 rounded-full bg-pri px-6 text-[16px]/none font-extrabold text-pri-tx shadow-[0_3px_0_var(--lip)] transition-[transform,box-shadow] duration-[80ms] active:translate-y-[3px] active:shadow-none"
        >
          <i className="ph-bold ph-plus text-[16px]" />Novo objetivo
        </button>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        {data?.goals.map((g) => {
          const v = goalCardView(g, data.steps[g.id] ?? [], data.today, data.tz);
          const color = objColor(g.colorIndex);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => router.push(`/objetivos/${g.id}`)}
              className="grid cursor-pointer grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px] items-center gap-8 rounded-[16px] border border-border bg-surface p-6 text-left text-tx shadow-card hover:border-pri"
            >
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className={`flex items-center gap-2 ${KICKER}`}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  {v.kindLabel}
                </span>
                <b className="font-fredoka text-[20px]/[26px] font-semibold">{g.title}</b>
                <span className="text-[14px]/[20px] font-semibold text-tx2">{v.nextLine}</span>
              </span>
              <span className="flex flex-col gap-2">
                <span className="h-2.5 overflow-hidden rounded-full bg-s2">
                  <span className="block h-full rounded-full" style={{ width: `${g.progressPct}%`, background: color }} />
                </span>
                <span className="flex items-center gap-1.5 text-[12px]/[16px] font-semibold text-tx2">
                  <i className={`ph-bold ${v.late ? "ph-warning-circle text-danger" : "ph-check-circle text-pri"} text-[14px]`} />
                  {v.folgaLine}
                </span>
              </span>
              <span className="flex items-center justify-end gap-3">
                <b className="font-fredoka text-[28px]/none font-semibold" style={{ color: objInk(g.colorIndex) }}>{g.progressPct}%</b>
                <i className="ph-bold ph-caret-right text-[18px] text-tx2" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
