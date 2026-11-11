"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import Broto from "@/modules/landing/components/broto.component";
import { authRepository } from "@/modules/auth/data";
import { GAMIFICATION } from "@/modules/gamification/data/example-gamification.data";

// Sidebar do web app (Bora App.dc.html), com os itens do protótipo. "Tarefas leves" (fora do MVP)
// ainda fica sem ação.
const NAV: { label: string; icon: string; href: string | null; match: string }[] = [
  { label: "Hoje", icon: "sun", href: "/hoje", match: "/hoje" },
  { label: "Calendário", icon: "calendar-blank", href: "/calendario", match: "/calendario" },
  { label: "Objetivos", icon: "flag-banner", href: "/objetivos", match: "/objetivos" },
  { label: "Tarefas leves", icon: "broom", href: null, match: "/tarefas" },
  { label: "Jardim", icon: "plant", href: "/jardim", match: "/jardim" },
  { label: "Configurações", icon: "gear-six", href: "/configuracoes", match: "/configuracoes" },
];

// O item ativo depende da URL; fica num Suspense para não bloquear o pré-render das rotas dinâmicas.
function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav className="mt-7 flex flex-col gap-1">
      {NAV.map((n) => {
        const on = pathname.startsWith(n.match);
        return (
          <button
            key={n.label}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => n.href && router.push(n.href)}
            className={`flex h-11 cursor-pointer items-center gap-3 rounded-full px-3.5 text-left text-[15px]/none transition-[background] duration-[120ms] ${
              on ? "bg-pri-soft font-extrabold text-tx" : "font-semibold text-tx2"
            }`}
          >
            <i className={`${on ? "ph-fill" : "ph"} ph-${n.icon} text-[22px] ${on ? "text-pri" : "text-tx2"}`} />
            {n.label}
          </button>
        );
      })}
    </nav>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const g = GAMIFICATION;

  useEffect(() => {
    authRepository.me().then(({ user }) => setName(user.name));
  }, []);

  return (
    <div className="flex min-h-screen min-w-[1200px] bg-bg font-nunito text-tx">
      <aside className="fixed top-0 left-0 z-20 box-border flex h-screen w-[240px] flex-none flex-col border-r border-border bg-surface px-3 pt-5 pb-3">
        <Link href="/" className="flex items-center gap-2 px-2 text-tx hover:text-tx">
          <Broto size={36} />
          <span className="font-fredoka text-[26px]/none font-bold tracking-[-0.01em]">bora</span>
        </Link>
        <Suspense fallback={<nav className="mt-7 h-[284px]" />}>
          <SidebarNav />
        </Suspense>
        <button
          type="button"
          onClick={() => router.push("/hoje?novo=1")}
          className="mt-4 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-border bg-surface text-[15px]/none font-extrabold text-blue shadow-[0_3px_0_var(--border)] transition-[transform,box-shadow] duration-[80ms] active:translate-y-[3px] active:bg-s2 active:shadow-none"
        >
          <i className="ph-bold ph-plus text-[16px]" />
          Novo objetivo
        </button>
        <div className="mt-auto flex flex-col gap-2.5 border-t border-border pt-3">
          <button type="button" className="flex cursor-pointer items-center gap-2.5 bg-transparent px-1 text-left text-tx">
            <Broto size={40} stage={g.stage} />
            <span className="flex flex-col">
              <b className="text-[15px]/[20px] font-extrabold">{name}</b>
              <span className="text-[12px]/[16px] font-semibold text-tx2">{g.stageLabel}</span>
            </span>
          </button>
          <div className="flex w-fit items-center gap-1 rounded-full border border-border bg-surface p-1">
            <span title="Dias regados" className="flex items-center gap-1 px-[7px] py-1.5">
              <i className="ph-fill ph-leaf text-[18px] text-streak" />
              <b className="font-fredoka text-[16px]/none font-semibold">{g.streak}</b>
            </span>
            <span title="Gotas" className="flex items-center gap-1 px-[7px] py-1.5">
              <i className="ph-fill ph-drop text-[18px] text-blue-fill" />
              <b className="font-fredoka text-[16px]/none font-semibold">{g.drops}</b>
            </span>
            <span title={`${g.xp} / ${g.xpNeeded} XP`} className="flex flex-none items-center gap-2 rounded-full bg-s2 py-1.5 pr-2.5 pl-2">
              <b className="font-fredoka text-[14px]/none font-semibold whitespace-nowrap text-pri">Nv {g.level}</b>
              <span className="h-1.5 w-9 overflow-hidden rounded-full bg-border">
                <span className="block h-full bg-fill" style={{ width: `${Math.round((g.xp / g.xpNeeded) * 100)}%` }} />
              </span>
            </span>
          </div>
        </div>
      </aside>
      <main className="relative ml-[240px] min-w-0 flex-1">{children}</main>
    </div>
  );
}
