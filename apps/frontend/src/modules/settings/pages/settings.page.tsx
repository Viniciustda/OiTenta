"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { authRepository } from "@/modules/auth/data";
import Slider from "@/modules/core/components/slider.component";
import { KICKER, objColor } from "@/modules/core/components/ui";
import { clock } from "@/modules/core/data/clock";
import { DEFAULT_TIMEZONE, dayOfMonth, formatDuration, formatHm, localDate, minutesBetween, monthName, weekdayLong } from "@/modules/core/format/time.format";
import { GAMIFICATION } from "@/modules/gamification/data/example-gamification.data";
import Broto from "@/modules/landing/components/broto.component";
import AvailGrid from "@/modules/scheduling/components/avail-grid.component";
import { schedulingRepository, type PlanBlock } from "@/modules/scheduling/data";
import { LIMIT_DEFAULT, LIMIT_MAX, LIMIT_MIN, emptyGrid, gridToWindows, windowsToGrid, type HourGrid } from "@/modules/scheduling/logic/availability-grid.logic";
import { settingsRepository, type Preferences, type Theme } from "../data";

// W26 Configurações (AppConfig.dc.html).
// - Disponibilidade e limite diário: GET/PUT /scheduling/availability (contrato §2). Grava sozinho, logo depois
//   da última mudança ("o plano se reorganiza na hora"). Grade vazia não é gravada: o contrato exige uma janela.
// - Tema e e-mail diário: sem endpoint; ficam nas preferências de exemplo (settingsRepository). O tema escolhido
//   ainda não muda as cores do app (ver afazeres).
// - Prévia do e-mail: o plano de hoje (GET /scheduling/plan/day); a tarefa leve e os dias regados são exemplo (P18).
const PANEL = "rounded-[16px] border border-border bg-surface shadow-card";
const H2 = "m-0 font-fredoka text-[20px]/[26px] font-semibold";
const DESC = "mt-1 mb-0 text-[16px]/[24px] text-tx2";
const SAVE_DELAY_MS = 400;
/** example: "Tarefas leves" está fora do MVP; a prévia usa a do protótipo. */
const EXAMPLE_LIGHT_TASK = "Lavar a louça · 10 min";

const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: "light", label: "Claro", icon: "ph-bold ph-sun" },
  { id: "dark", label: "Escuro", icon: "ph-bold ph-moon" },
];

interface Account {
  name: string;
  email: string;
  timezone: string;
  dateLabel: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const now = clock.now();
  const [account, setAccount] = useState<Account | null>(null);
  const [grid, setGrid] = useState<HourGrid>(emptyGrid);
  const [limit, setLimit] = useState(LIMIT_DEFAULT);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [today, setToday] = useState<PlanBlock[]>([]);
  const pending = useRef<{ timer: ReturnType<typeof setTimeout>; save: () => void } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { user } = await authRepository.me();
      const date = localDate(now, user.timezone);
      const [avail, p, day] = await Promise.all([
        schedulingRepository.getAvailability().catch(() => null),
        settingsRepository.getPreferences(),
        schedulingRepository.getDayPlan(date),
      ]);
      if (!alive) return;
      setAccount({ name: user.name, email: user.email, timezone: user.timezone, dateLabel: `${weekdayLong(date)}, ${dayOfMonth(date)} de ${monthName(date)}` });
      if (avail) {
        setGrid(windowsToGrid(avail.availability.windows));
        setLimit(avail.availability.dailyLimitMinutes);
      }
      setPrefs(p);
      setToday(day.blocks.filter((b) => b.status === "planned").slice(0, 3));
    })();
    return () => {
      alive = false;
    };
  }, [now]);

  const flush = useCallback(() => {
    const p = pending.current;
    if (!p) return;
    clearTimeout(p.timer);
    pending.current = null;
    p.save();
  }, []);

  // Se a tela sair antes do prazo, a mudança pendente é gravada na hora.
  useEffect(() => flush, [flush]);

  const scheduleSave = (g: HourGrid, l: number) => {
    if (pending.current) clearTimeout(pending.current.timer);
    const windows = gridToWindows(g);
    const save = () => {
      if (windows.length) schedulingRepository.setAvailability({ windows, dailyLimitMinutes: l }).catch(() => {});
    };
    pending.current = { timer: setTimeout(flush, SAVE_DELAY_MS), save };
  };

  const changeGrid = (g: HourGrid) => {
    setGrid(g);
    scheduleSave(g, limit);
  };

  const changeLimit = (l: number) => {
    setLimit(l);
    scheduleSave(grid, l);
  };

  const pickTheme = async (theme: Theme) => setPrefs(await settingsRepository.setTheme(theme));
  const toggleEmail = async () => {
    if (prefs) setPrefs(await settingsRepository.setDailyEmail(!prefs.dailyEmail));
  };

  const logout = async () => {
    flush();
    await authRepository.logout();
    router.replace("/entrar");
  };

  const emailOn = prefs?.dailyEmail ?? false;
  const limitLabel = formatDuration(limit);
  const firstName = account?.name ?? "";

  return (
    <div className="box-border flex max-w-[960px] flex-col gap-6 px-12 pt-10 pb-16">
      <div>
        <span className={KICKER}>{account ? `${account.name} · ${account.email}` : ""}</span>
        <h1 className="mt-1.5 mb-0 font-fredoka text-[40px]/[48px] font-semibold">Configurações</h1>
      </div>

      <section className={`flex items-center justify-between gap-6 p-6 ${PANEL}`}>
        <div>
          <h2 className={H2}>Tema</h2>
          <p className={DESC}>O escuro descansa a vista à noite.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-s2 p-1">
          {THEMES.map((t) => {
            const on = prefs?.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => pickTheme(t.id)}
                className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border px-[18px] text-[14px]/none font-extrabold text-tx ${on ? "border-border bg-surface" : "border-transparent bg-transparent"}`}
              >
                <i className={`${t.icon} text-[18px]`} />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className={`flex flex-col gap-5 p-6 ${PANEL}`}>
        <div>
          <h2 className={H2}>Disponibilidade</h2>
          <p className={DESC}>Pinte os horários livres arrastando o mouse. O plano se reorganiza na hora.</p>
        </div>
        <AvailGrid grid={grid} onChange={changeGrid} cellHeight={24} />
      </section>

      <section className={`flex flex-col gap-4 p-6 ${PANEL}`}>
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className={H2}>Limite diário</h2>
            <p className={DESC}>Eu nunca encaixo mais que isso num dia.</p>
          </div>
          <b className="font-fredoka text-[28px]/[36px] font-semibold text-pri">{limitLabel}</b>
        </div>
        <Slider label="Limite diário" value={limit} scaleMin={LIMIT_MIN} scaleMax={LIMIT_MAX} min={LIMIT_MIN} max={LIMIT_MAX} step={30} onChange={changeLimit} valueText={limitLabel} />
        <div className="flex justify-between text-[12px]/[16px] font-semibold text-tx2">
          <span>1h</span>
          <span>5h</span>
        </div>
      </section>

      <section className={`flex flex-col gap-5 p-6 ${PANEL}`}>
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className={H2}>E-mail diário</h2>
            <p className={DESC}>Todo dia às 07:00, com o plano do dia e um botão pra começar.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={emailOn}
            aria-label="E-mail diário"
            onClick={toggleEmail}
            className={`relative h-8 w-14 flex-none cursor-pointer rounded-full transition-[background] duration-150 ${emailOn ? "bg-pri" : "bg-border"}`}
          >
            <span
              className="absolute top-1 h-6 w-6 rounded-full bg-surface shadow-[0_1px_2px_rgba(14,31,26,.2)] transition-[left] duration-150"
              style={{ left: emailOn ? 28 : 4 }}
            />
          </button>
        </div>
        <div
          aria-label="Prévia do e-mail diário"
          className="flex justify-center rounded-[16px] bg-bg p-6 transition-opacity duration-200"
          style={{ opacity: emailOn ? 1 : 0.4 }}
        >
          <div className="w-[520px] overflow-hidden rounded-[16px] border border-border bg-surface">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-s2">
                <Broto size={28} />
              </span>
              <span className="flex flex-1 flex-col">
                <b className="text-[14px]/[20px] font-extrabold">Bora</b>
                <span className="text-[12px]/[16px] font-semibold text-tx2">Seu plano de hoje, {firstName}</span>
              </span>
              <span className="text-[12px]/[16px] font-semibold text-tx2">07:00</span>
            </div>
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <Broto size={56} mood="animado" />
                <div>
                  <div className="font-fredoka text-[24px]/[30px] font-semibold">Seu plano de hoje, {firstName}</div>
                  <div className="text-[14px]/[20px] font-semibold text-tx2">{account?.dateLabel}</div>
                </div>
              </div>
              {today.length > 0 && (
                <div className="flex flex-col rounded-[16px] border border-border">
                  {today.map((b, i) => (
                    <div key={b.id} className={`flex items-center gap-3 px-3.5 py-3 ${i < today.length - 1 ? "border-b border-border" : ""}`}>
                      <span className="w-14 rounded-full bg-blue-soft py-1 text-center text-[13px]/[16px] font-extrabold text-blue">{formatHm(b.start, account?.timezone ?? DEFAULT_TIMEZONE)}</span>
                      <span className="flex flex-1 flex-col">
                        <b className="text-[15px]/[20px] font-bold">{b.stepTitle}</b>
                        <span className="flex items-center gap-1.5 text-[12px]/[16px] font-semibold text-tx2">
                          <span className="h-2 w-2 rounded-full" style={{ background: objColor(b.colorIndex) }} />
                          {b.goalTitle} · {formatDuration(minutesBetween(b.start, b.end))}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 rounded-[16px] bg-s2 px-3.5 py-3">
                <i className="ph ph-broom text-[20px] text-tx2" />
                <span className="flex-1 text-[15px]/[20px] font-bold">{EXAMPLE_LIGHT_TASK}</span>
                <span className="flex items-center gap-[3px] font-fredoka text-[14px]/none font-semibold">
                  <i className="ph-fill ph-drop text-[14px] text-blue-fill" />+3
                </span>
              </div>
              <div className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-pri text-[16px]/none font-extrabold text-pri-tx shadow-[0_3px_0_var(--lip)]">
                <i className="ph-fill ph-play text-[16px]" />Vamos começar?
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[14px]/[20px] font-semibold text-tx2">
                <i className="ph-fill ph-leaf text-[18px] text-streak" />
                <b className="font-fredoka text-[16px]/none font-semibold text-tx">{GAMIFICATION.streak}</b>dias regados
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between py-2">
        <span className="text-[14px]/[20px] font-semibold text-tx2">Bora · versão demo</span>
        <button
          type="button"
          onClick={logout}
          className="flex h-11 cursor-pointer items-center gap-1.5 rounded-full bg-transparent px-4 text-[15px]/none font-extrabold text-blue hover:bg-blue-soft"
        >
          <i className="ph-bold ph-sign-out text-[16px]" />Sair
        </button>
      </section>
    </div>
  );
}
