"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/modules/core/data/api-error";
import { PRIMARY_BTN } from "@/modules/core/components/ui";
import { DEMO_USER } from "@/modules/core/data/example-data";
import Broto from "@/modules/landing/components/broto.component";
import { schedulingRepository } from "@/modules/scheduling/data";
import { authRepository } from "../data";

// W03 login e W04 cadastro (AppLogin.dc.html). Os campos vêm preenchidos como no protótipo.
export type AuthMode = "login" | "cadastro";

const TEXT = {
  login: {
    title: "Que bom te ver de novo",
    cta: "Entrar",
    headline: "Bora começar pelo degrau mais fácil?",
    sub: "Seu plano de hoje já tá pronto. É só entrar e tocar em “Vamos começar?”.",
    demo: "Entrar direto como Arthur (demo)",
  },
  cadastro: {
    title: "Criar sua conta",
    cta: "Criar conta",
    headline: "Oi! Eu sou o Broto. Vamos montar seu plano sem drama?",
    sub: "Leva uns minutos: você me mostra quando tá livre e eu cuido do resto.",
    demo: "Pular e ver o onboarding (demo)",
  },
};

function Field({ id, label, icon, value, onChange, type = "text", placeholder }: {
  id: string; label: string; icon: string; value: string; onChange: (v: string) => void; type?: string; placeholder: string;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[13px]/[16px] font-extrabold">{label}</span>
      <span className="box-border flex h-[52px] items-center gap-2.5 rounded-[12px] border-2 border-border bg-surface px-3.5">
        <i className={`ph ph-${icon} text-[20px] text-tx2`} />
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border-0 bg-transparent text-[15px]/none font-semibold text-tx outline-0"
        />
      </span>
    </label>
  );
}

export default function LoginPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const t = TEXT[mode];
  const isCad = mode === "cadastro";
  const [nome, setNome] = useState(DEMO_USER.name);
  const [email, setEmail] = useState(DEMO_USER.email);
  const [senha, setSenha] = useState(DEMO_USER.password);
  const [error, setError] = useState<string | null>(null);

  // P12/W11: depois do login, sem disponibilidade (404) vai para o onboarding; com, para o Hoje.
  const goAfterLogin = async () => {
    try {
      await schedulingRepository.getAvailability();
      router.push("/hoje");
    } catch {
      router.push("/onboarding");
    }
  };

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Algo deu errado. Tenta de novo.");
    }
  };

  const submit = () =>
    run(async () => {
      if (isCad) {
        await authRepository.register({ name: nome, email, password: senha, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        await authRepository.login({ email, password: senha });
        router.push("/onboarding");
      } else {
        await authRepository.login({ email, password: senha });
        await goAfterLogin();
      }
    });

  const demo = () =>
    run(async () => {
      if (isCad) {
        router.push("/onboarding");
        return;
      }
      await authRepository.demo();
      await goAfterLogin();
    });

  const tab = (on: boolean) =>
    `flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full border text-[15px]/none font-extrabold text-tx ${
      on ? "border-border bg-surface" : "border-transparent bg-transparent"
    }`;

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-bg font-nunito text-tx">
      <div className="flex flex-col justify-between bg-s2 px-16 py-10">
        <Link href="/" className="flex w-fit items-center gap-2.5 text-tx hover:text-tx">
          <Broto size={44} />
          <span className="font-fredoka text-[30px]/none font-bold tracking-[-0.01em]">bora</span>
        </Link>
        <div className="flex max-w-[480px] flex-col gap-6">
          <Broto size={180} mood="animado" wave />
          <h1 className="m-0 font-fredoka text-[40px]/[48px] font-semibold text-balance">{t.headline}</h1>
          <p className="m-0 text-[18px]/[28px] text-pretty text-tx2">{t.sub}</p>
        </div>
        <span className="text-[14px]/[20px] font-semibold text-tx2">© 2026 Bora</span>
      </div>
      <div className="flex items-center justify-center p-10">
        <div className="flex w-[420px] flex-col gap-5">
          <div role="tablist" className="flex gap-1 rounded-full bg-s2 p-1">
            <button type="button" role="tab" aria-selected={!isCad} className={tab(!isCad)} onClick={() => router.push("/entrar")}>Entrar</button>
            <button type="button" role="tab" aria-selected={isCad} className={tab(isCad)} onClick={() => router.push("/cadastro")}>Criar conta</button>
          </div>
          <h2 className="mt-2 mb-0 font-fredoka text-[28px]/[36px] font-semibold">{t.title}</h2>
          {isCad && <Field id="nome" label="Como você quer ser chamado?" icon="user" value={nome} onChange={setNome} placeholder="Arthur" />}
          <Field id="email" label="E-mail" icon="envelope-simple" value={email} onChange={setEmail} placeholder="voce@faculdade.edu.br" />
          <Field id="senha" label="Senha" icon="lock-simple" type="password" value={senha} onChange={setSenha} placeholder="••••••••" />
          {error && (
            <p role="alert" className="m-0 text-[14px]/[20px] font-bold text-danger">{error}</p>
          )}
          <button type="button" onClick={submit} className={`mt-2 ${PRIMARY_BTN}`}>
            {t.cta}
            <i className="ph-bold ph-arrow-right text-[18px]" />
          </button>
          <button type="button" onClick={demo} className="h-11 cursor-pointer rounded-full bg-transparent text-[15px]/none font-extrabold text-blue hover:bg-blue-soft">
            {t.demo}
          </button>
        </div>
      </div>
    </div>
  );
}
