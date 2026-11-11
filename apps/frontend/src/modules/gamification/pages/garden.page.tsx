import { KICKER } from "@/modules/core/components/ui";
import Broto from "@/modules/landing/components/broto.component";
import {
  GARDEN,
  GARDEN_BADGES,
  GARDEN_HEAT,
  GARDEN_STAGES,
  GARDEN_WEEK,
  type BadgeState,
  type GardenDayState,
} from "../data/example-gamification.data";

// W25 Jardim (AppJardim.dc.html). Gamificação fora do MVP: tudo vem dos valores fixos do protótipo (P18),
// em data/example-gamification.data.ts. "Comprar" o guarda-chuva fica sem ação (não há gotas reais).
const PANEL = "rounded-[16px] border border-border bg-surface shadow-card";

const DAY: Record<GardenDayState, { box: string; icon: string }> = {
  watered: { box: "border-transparent bg-pri-soft text-pri", icon: "ph-fill ph-drop" },
  protected: { box: "border-transparent bg-blue-soft text-blue", icon: "ph-fill ph-umbrella" },
  pending: { box: "border-dashed border-border bg-transparent text-tx2", icon: "ph ph-drop" },
};

const HEAT = ["bg-s2", "bg-pri-soft", "bg-[var(--heatMid)]", "bg-fill", "bg-pri"];

const BADGE: Record<BadgeState, { box: string; name: string; sub: string }> = {
  on: { box: "border-solid border-fill bg-pri-soft text-pri", name: "text-tx", sub: "text-tx2" },
  rare: { box: "border-solid border-streak bg-[var(--streakSoft)] text-[var(--streakInk)]", name: "text-tx", sub: "text-[var(--streakInk)]" },
  lock: { box: "border-dashed border-border bg-s2 text-tx2", name: "text-tx2", sub: "text-tx2" },
};

export default function GardenPage() {
  const g = GARDEN;
  const current = GARDEN_STAGES.findIndex((s) => s.id === g.stage);
  const xpPct = Math.round((g.xp / g.xpNeeded) * 100);

  return (
    <div className="box-border flex max-w-[1200px] flex-col gap-8 px-12 pt-10 pb-16">
      <div>
        <span className={KICKER}>Você rega, ele cresce</span>
        <h1 className="mt-1.5 mb-0 font-fredoka text-[40px]/[48px] font-semibold">Jardim</h1>
      </div>

      <div className="grid grid-cols-2 items-stretch gap-6">
        <div className={`flex flex-col items-center gap-5 p-8 ${PANEL}`}>
          <Broto size={220} stage={g.stage} mood="animado" wave />
          <div className="text-center">
            <b className="font-fredoka text-[40px]/[48px] font-semibold">Nível {g.level}</b>
            <div className="text-[16px]/[24px] font-semibold text-tx2">
              {g.stageName} · {g.xpNeeded - g.xp} min de foco até o Nível {g.level + 1}
            </div>
          </div>
          <div className="flex flex-col gap-2 self-stretch">
            <span className="flex justify-between text-[14px]/[20px] font-bold">
              <span>XP de foco</span>
              <b className="font-fredoka text-[16px]/none font-semibold">{`${g.xp} / ${g.xpNeeded}`}</b>
            </span>
            <span className="h-2.5 overflow-hidden rounded-full bg-s2">
              <span className="block h-full rounded-full bg-fill" style={{ width: `${xpPct}%` }} />
            </span>
            <span className="text-[12px]/[16px] font-semibold text-tx2">1 XP = 1 minuto de foco. O Broto muda nos níveis 4, 9, 15 e 25.</span>
          </div>
          <div className="grid grid-cols-5 gap-2 self-stretch border-t border-border pt-4">
            {GARDEN_STAGES.map((s, i) => (
              <div
                key={s.id}
                className={`flex flex-col items-center gap-1.5 rounded-[12px] px-1 py-2 ${i === current ? "bg-pri-soft" : ""}`}
                style={{ opacity: i > current ? 0.5 : 1 }}
              >
                <Broto size={52} stage={s.id} mood={i === current ? "animado" : "ok"} />
                <b className="text-center font-fredoka text-[13px]/[16px] font-semibold">{s.name}</b>
                <span className="text-[12px]/[16px] font-semibold text-tx2">{s.levels}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className={`flex flex-col gap-4 p-6 ${PANEL}`}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <i className="ph-fill ph-leaf text-[24px] text-streak" />
                <b className="font-fredoka text-[28px]/[36px] font-semibold">{g.streak}</b>
                <span className="text-[16px]/[24px] font-bold text-tx2">dias regados</span>
              </span>
              <span className="text-[14px]/[20px] font-semibold text-tx2">{g.wateredToday ? "Hoje já foi regado" : "Falta regar hoje"}</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {GARDEN_WEEK.map((d, i) => (
                <div key={i} data-testid="garden-week-day" className="flex flex-col items-center gap-1.5">
                  <span className={`box-border flex aspect-square w-full items-center justify-center rounded-[12px] border-2 ${DAY[d.state].box}`}>
                    <i className={`${DAY[d.state].icon} text-[20px]`} />
                  </span>
                  <span className="text-[12px]/[16px] font-extrabold text-tx2">{d.label}</span>
                </div>
              ))}
            </div>
            <span className="text-[12px]/[16px] font-semibold text-tx2">
              O dia conta com 1 degrau cumprido. Quebrar a sequência só murcha o Broto, sem culpa.
            </span>
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <span className={KICKER}>Últimas 12 semanas</span>
              <div className="grid grid-cols-12 gap-1">
                {GARDEN_HEAT.map((col, w) => (
                  <div key={w} className="flex flex-col gap-1">
                    {col.map((c, d) => (
                      <span
                        key={d}
                        data-testid="garden-heat-cell"
                        title={c.today ? "Hoje" : c.level ? "Regado" : "Sem rega"}
                        className={`box-border aspect-square rounded-[4px] ${c.today && !g.wateredToday ? "border-2 border-dashed border-border bg-transparent" : HEAT[c.level]}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-4 px-6 py-5 ${PANEL}`}>
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-[12px] bg-blue-soft text-blue">
              <i className="ph-fill ph-umbrella text-[28px]" />
            </span>
            <span className="flex flex-1 flex-col">
              <span className={KICKER}>Loja</span>
              <b className="font-fredoka text-[18px]/[24px] font-semibold">Guarda-chuva</b>
              <span className="text-[13px]/[18px] font-semibold text-tx2">{`Protege 1 dia sem rega · você tem ${g.umbrellas}`}</span>
            </span>
            <button
              type="button"
              className="flex h-[52px] cursor-pointer items-center gap-1.5 rounded-full border-2 border-border bg-surface px-5 text-[16px]/none font-extrabold text-blue shadow-[0_3px_0_var(--border)] transition-[transform,box-shadow] duration-[80ms] active:translate-y-[3px] active:bg-s2 active:shadow-none"
            >
              <i className="ph-fill ph-drop text-[16px] text-blue-fill" />
              {`${g.umbrellaPrice} · Comprar`}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="m-0 font-fredoka text-[28px]/[36px] font-semibold">Conquistas</h2>
        <ul aria-label="Conquistas" className="m-0 grid list-none grid-cols-5 gap-4 p-0">
          {GARDEN_BADGES.map((b) => {
            const st = BADGE[b.state];
            return (
              <li key={b.name} className="flex flex-col items-center gap-2.5 rounded-[16px] border border-border bg-surface px-3 py-5 text-center">
                <span className={`box-border flex h-20 w-20 items-center justify-center rounded-full border-2 ${st.box}`}>
                  <i className={`${b.icon} text-[34px]`} />
                </span>
                <b className={`font-fredoka text-[16px]/[20px] font-semibold ${st.name}`}>{b.name}</b>
                <span className={`text-[12px]/[16px] font-semibold ${st.sub}`}>{b.sub}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
