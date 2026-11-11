"use client";

import { useState } from "react";
import Broto, { type BrotoMood } from "../components/broto.component";
import PhoneRampa from "../components/phone-rampa.component";

// Landing web, portada de design/web/source/Bora Landing Web.dc.html (largura fixa de 1440 px).
// Textos, ordem, medidas e comportamentos seguem o protótipo; cores só por tokens.

const STEPS = [
  { name: "Aquecer", dur: "3 min", icon: "person-simple-walk", desc: "Levanta, bebe água, abre o material. Só isso.", alt: "Arruma a mesa e deixa só o que vai usar." },
  { name: "Desafio", dur: "2 min", icon: "calculator", desc: "Uma pergunta rápida pra acordar a cabeça.", alt: "Explica o tema em uma frase, do seu jeito." },
  { name: "Micro-passo", dur: "1 min", icon: "footprints", desc: "Um passo tão pequeno que não dá pra travar.", alt: "Escreve só o título do que vai fazer." },
  { name: "Foco", dur: "25 min", icon: "timer", desc: "Timer azul, notificações quietas e o Broto de óculos.", alt: "Prefere 15 min? Dá pra encurtar o foco." },
  { name: "Registrar", dur: "1 min", icon: "check-circle", desc: "Concluí, parcial ou não rolou. Tudo conta.", alt: "Anota onde parou pra voltar mais fácil." },
];
const STEP_MOODS: BrotoMood[] = ["ok", "animado", "ok", "focado", "comemorando"];

const ENERGY: { name: string; desc: string; mood: BrotoMood }[] = [
  { name: "Baixa", desc: "Rampa leve, aquecimento longo", mood: "sonolento" },
  { name: "Média", desc: "Rampa padrão de 25 min", mood: "ok" },
  { name: "Alta", desc: "Pula direto pro desafio", mood: "animado" },
];

const TAREFAS = [
  { name: "Lavar a louça", meta: "10 min · ideal p/ energia baixa" },
  { name: "Arrumar o guarda-roupa", meta: "20 min" },
];

const FAQ = [
  { q: "O Bora é de graça?", a: "Você começa grátis. Crie a conta, conte o que precisa entregar e monte o primeiro plano." },
  { q: "Preciso ter TDAH pra usar?", a: "Não. O Bora foi pensado pra quem trava pra começar, com ou sem diagnóstico. Ele não substitui acompanhamento profissional." },
  { q: "Como a IA entende o meu trabalho?", a: "Você escreve o que precisa entregar ou cola o link da atividade. A IA lê o enunciado, separa os requisitos e sugere as etapas. Você ajusta o que quiser." },
  { q: "E se eu não cumprir o plano?", a: "Tudo bem. O Bora recalcula as etapas, mostra a folga até o prazo e o Broto só murcha um pouco. Ele nunca morre." },
];

const STAGES = [
  { stage: "semente", name: "Semente", lv: "Nv 1–3" },
  { stage: "broto", name: "Broto", lv: "Nv 4–8" },
  { stage: "muda", name: "Muda", lv: "Nv 9–14" },
  { stage: "arbusto", name: "Arbusto", lv: "Nv 15–24" },
  { stage: "arvore", name: "Árvore jovem", lv: "Nv 25+" },
] as const;

const PRIMARY_BTN =
  "flex h-[52px] items-center gap-2.5 rounded-full bg-pri px-7 text-[16px]/none font-extrabold text-pri-tx shadow-[0_3px_0_var(--lip)] transition-[transform,box-shadow] duration-[80ms] hover:text-pri-tx active:translate-y-[3px] active:shadow-none active:brightness-[.94] cursor-pointer";
const NAV_LINK =
  "flex h-11 items-center rounded-full px-4 text-[16px]/none font-bold text-tx2 hover:bg-s2 hover:text-tx";
const H2 = "m-0 font-fredoka text-[40px]/[48px] font-semibold";
const LEAD = "text-[18px]/[28px] text-tx2 text-pretty";
const CARD = "rounded-[16px] border border-border bg-surface shadow-card";
const FEATURE_ICON =
  "flex h-12 w-12 flex-none items-center justify-center rounded-[12px] bg-pri-soft text-pri";

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pri-soft font-fredoka text-[20px]/none font-semibold text-pri">
      {n}
    </span>
  );
}

function ObjDot({ color }: { color: "bg-obj1" | "bg-obj2" | "bg-obj3" }) {
  return <span className={`h-2 w-2 rounded-full ${color}`} />;
}

export default function LandingPage() {
  const [cur, setCur] = useState(2);
  const [alt, setAlt] = useState(false);
  const [faq, setFaq] = useState(0);
  const [energy, setEnergy] = useState(1);
  const [done, setDone] = useState([true, false]);

  return (
    <div lang="pt-BR" className="mx-auto w-[1440px] overflow-hidden bg-bg font-nunito text-tx shadow-card">
      {/* Cabeçalho */}
      <header className="flex h-[88px] items-center justify-between px-[120px]">
        <a href="#" className="flex items-center gap-2.5 text-tx">
          <Broto size={44} />
          <span className="font-fredoka text-[30px]/none font-bold tracking-[-0.01em]">bora</span>
        </a>
        <nav className="flex items-center gap-1">
          <a href="#como" className={NAV_LINK}>Como funciona</a>
          <a href="#estudantes" className={NAV_LINK}>Para estudantes</a>
          <span className="mx-3 h-6 w-px bg-border" />
          <a href="/entrar" className="flex h-11 cursor-pointer items-center rounded-full px-4 text-[16px]/none font-extrabold text-blue hover:bg-blue-soft hover:text-blue">
            Entrar
          </a>
          <a href="/cadastro" className="ml-2 box-border flex h-[52px] cursor-pointer items-center rounded-full border-2 border-border bg-surface px-6 text-[16px]/none font-extrabold text-blue shadow-[0_3px_0_var(--border)] transition-[transform,box-shadow] duration-[80ms] hover:text-blue active:translate-y-[3px] active:bg-s2 active:shadow-none">
            Começar grátis
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="grid grid-cols-[minmax(0,1fr)_520px] items-center gap-16 px-[120px] pt-8 pb-32">
        <div>
          <h1 className="m-0 font-fredoka text-[64px]/[72px] font-bold tracking-[-0.01em] text-balance text-tx">
            Pare de adiar.
            <br />
            Comece pelo degrau mais fácil.
          </h1>
          <p className={`mt-6 mb-0 max-w-[540px] ${LEAD}`}>
            A IA quebra seus trabalhos em etapas, encaixa no seu calendário e te leva do zero ao foco em 25 minutos.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <a href="/cadastro" className={PRIMARY_BTN}>
              Começar grátis
              <i className="ph-bold ph-arrow-right text-[18px]" />
            </a>
            <a href="#como" className="flex h-11 items-center rounded-full px-4 text-[16px]/none font-extrabold text-blue hover:bg-blue-soft hover:text-blue">
              Ver como funciona
            </a>
          </div>
        </div>
        <div className="relative h-[720px]">
          <div className="absolute top-[120px] left-[30px] h-[480px] w-[480px] rounded-full bg-s2" />
          <div className="absolute top-5 left-[130px] h-[677px] w-[323px]">
            <div className="h-[868px] w-[414px] origin-top-left scale-[.78]">
              <PhoneRampa />
            </div>
          </div>
          <div className="absolute top-[148px] left-[340px] flex items-center gap-3 rounded-full bg-tx py-2.5 pr-5 pl-2.5 text-bg shadow-float">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-toast-icon-bg">
              <i className="ph-fill ph-drop text-[20px] text-toast-icon" />
            </span>
            <span className="flex flex-col">
              <b className="font-fredoka text-[18px]/[22px] font-bold">+5 gotas</b>
              <span className="text-[12px]/[16px] font-semibold opacity-80">Degrau concluído</span>
            </span>
          </div>
          <div className="absolute top-[500px] -left-3">
            <Broto size={180} mood="animado" wave />
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como" className="px-[120px] pb-32">
        <div className="max-w-[640px]">
          <h2 className={H2}>Como funciona</h2>
          <p className={`mt-4 mb-0 ${LEAD}`}>Três passos entre o enunciado e o primeiro minuto de foco.</p>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-8">
          <div className="flex flex-col gap-6">
            <div className={`box-border flex h-[300px] flex-col justify-center gap-3 p-6 ${CARD}`}>
              <div className="box-border min-h-24 rounded-[12px] border-2 border-blue px-3.5 py-3 text-[18px]/[26px] text-tx">
                trabalho de Engenharia de Software para dia 20
                <span className="ml-0.5 inline-block h-5 w-0.5 bg-blue align-[-3px]" />
              </div>
              <div className="flex flex-col gap-2.5 rounded-[16px] border border-border bg-bg p-3.5">
                <span className="flex items-center gap-2 text-[14px]/[20px] font-extrabold text-blue">
                  <i className="ph-bold ph-sparkle text-[16px]" />A IA achou 3 requisitos
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {["diagrama UML", "PDF", "10 páginas"].map((chip) => (
                    <span key={chip} className="flex h-7 items-center rounded-full bg-s2 px-2.5 text-[13px]/none font-bold">
                      {chip}
                    </span>
                  ))}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <StepNumber n={1} />
              <h3 className="mt-2 mb-0 font-fredoka text-[20px]/[26px] font-semibold">Conte o que precisa entregar</h3>
              <p className="m-0 text-[16px]/[24px] text-pretty text-tx2">
                Escreva do seu jeito ou cole o link da atividade. A IA lê o enunciado e separa os requisitos.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className={`box-border flex h-[300px] flex-col gap-3 p-6 ${CARD}`}>
              <div className="grid grid-cols-5 gap-1.5 text-center text-[12px]/[16px] font-extrabold tracking-[.06em] text-tx2">
                <span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span>
              </div>
              <div className="grid flex-1 grid-cols-5 gap-1.5">
                <div className="flex flex-col gap-1.5 rounded-[8px] bg-s2 p-1"><span className="h-11 rounded-[6px] bg-obj1" /><span className="h-7 rounded-[6px] bg-obj2" /></div>
                <div className="flex flex-col gap-1.5 rounded-[8px] bg-s2 p-1"><span className="h-5" /><span className="h-[52px] rounded-[6px] bg-obj2" /></div>
                <div className="flex flex-col gap-1.5 rounded-[8px] bg-s2 p-1"><span className="h-16 rounded-[6px] bg-obj1" /><span className="h-[30px] rounded-[6px] bg-obj3" /></div>
                <div className="flex flex-col gap-1.5 rounded-[8px] bg-s2 p-1"><span className="h-9 rounded-[6px] bg-obj3" /><span className="h-3" /><span className="h-[34px] rounded-[6px] bg-obj1" /></div>
                <div className="flex flex-col gap-1.5 rounded-[8px] bg-s2 p-1"><span className="h-14 rounded-[6px] bg-obj1" /></div>
              </div>
              <div className="flex flex-wrap gap-3.5 text-[12px]/[16px] font-bold text-tx2">
                <span className="flex items-center gap-1.5"><ObjDot color="bg-obj1" />Eng. Software</span>
                <span className="flex items-center gap-1.5"><ObjDot color="bg-obj2" />Cálculo II</span>
                <span className="flex items-center gap-1.5"><ObjDot color="bg-obj3" />Portfólio</span>
              </div>
              <span className="flex items-center gap-1.5 text-[14px]/[20px] font-semibold text-tx2">
                <i className="ph-bold ph-check-circle text-[16px] text-pri" />Folga até o prazo: 2 dias
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <StepNumber n={2} />
              <h3 className="mt-2 mb-0 font-fredoka text-[20px]/[26px] font-semibold">A IA monta as etapas</h3>
              <p className="m-0 text-[16px]/[24px] text-pretty text-tx2">
                Quebra o trabalho em etapas e encaixa nos seus horários livres, respeitando o seu limite por dia.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className={`box-border flex h-[300px] flex-col items-center justify-center gap-5 p-6 ${CARD}`}>
              <Broto size={88} mood="animado" />
              <div className="flex cursor-pointer items-center gap-3.5 self-stretch rounded-full bg-pri py-3.5 pr-[22px] pl-3.5 text-pri-tx shadow-[0_3px_0_var(--lip)] transition-[transform,box-shadow] duration-[80ms] active:translate-y-[3px] active:shadow-none active:brightness-[.94]">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-on-pri-overlay">
                  <i className="ph-fill ph-play text-[22px]" />
                </span>
                <span className="flex flex-1 flex-col">
                  <b className="text-[20px]/[26px] font-extrabold">Vamos começar?</b>
                  <span className="text-[14px]/[20px] font-semibold opacity-90">Rampa de 25 min até o foco</span>
                </span>
                <i className="ph-bold ph-arrow-right text-[22px]" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <StepNumber n={3} />
              <h3 className="mt-2 mb-0 font-fredoka text-[20px]/[26px] font-semibold">Você só começa</h3>
              <p className="m-0 text-[16px]/[24px] text-pretty text-tx2">
                Um toque em “Vamos começar?” e você sobe a rampa até o foco. O Broto vai junto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Suba a rampa */}
      <section className="px-[120px] pb-32">
        <div className="flex items-end justify-between gap-16">
          <div className="max-w-[640px]">
            <h2 className={H2}>Suba a rampa</h2>
            <p className={`mt-4 mb-0 ${LEAD}`}>
              Cinco degraus curtos levam você do zero ao foco. Cada degrau cumprido rende +5 gotas, que regam o Broto. Clique num degrau pra ver.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2 text-[16px]/[24px] font-bold">{`Degrau ${cur + 1} de 5 · ${STEPS[cur].name}`}</span>
            <button
              type="button"
              onClick={() => setAlt((a) => !a)}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[14px]/none font-extrabold text-blue hover:bg-blue-soft"
            >
              <i className="ph-bold ph-arrows-clockwise text-[16px]" />
              Trocar
            </button>
            <button
              type="button"
              onClick={() => {
                setCur((c) => (c + 1) % 5);
                setAlt(false);
              }}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-3 text-[14px]/none font-extrabold text-blue hover:bg-blue-soft"
            >
              Pular
              <i className="ph-bold ph-skip-forward text-[16px]" />
            </button>
          </div>
        </div>
        <div className="mt-6 flex items-end gap-3">
          {STEPS.map((s, i) => {
            const isDone = i < cur;
            const isCur = i === cur;
            const look = isCur
              ? "bg-pri text-pri-tx border border-transparent shadow-[0_3px_0_var(--lip)]"
              : isDone
                ? "bg-pri-soft text-pri border border-transparent"
                : "bg-surface text-tx border border-border";
            const iconCls = isDone ? "ph-bold ph-check" : isCur ? `ph-fill ph-${s.icon}` : `ph ph-${s.icon}`;
            return (
              <div key={s.name} className="flex min-w-0 flex-1 flex-col">
                <div className="flex h-28 items-end justify-center">
                  {isCur && <Broto size={100} mood={STEP_MOODS[i]} />}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCur(i);
                    setAlt(false);
                  }}
                  style={{ height: 180 + i * 36 }}
                  className={`box-border flex cursor-pointer flex-col items-start gap-0.5 rounded-[16px_16px_8px_8px] p-5 text-left transition-[transform,box-shadow] duration-[80ms] ${look}`}
                >
                  <i className={`${iconCls} mb-2 text-[32px]`} />
                  <span className="text-[20px]/[24px] font-extrabold">{s.name}</span>
                  <span className="text-[16px]/[20px] font-semibold opacity-85">{s.dur}</span>
                  <span className="mt-1.5 flex items-center gap-1 font-fredoka text-[16px]/[20px] font-semibold">
                    <i className={`ph-fill ph-drop text-[16px] ${isCur || isDone ? "" : "text-blue-fill"}`} />
                    +5
                  </span>
                </button>
                <p className={`mt-5 mb-0 min-h-[72px] text-[16px]/[24px] text-pretty ${isCur ? "text-tx" : "text-tx2"}`}>
                  {isCur && alt ? s.alt : s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Para estudantes */}
      <section id="estudantes" className="px-[120px] pb-32">
        <div className="max-w-[720px]">
          <h2 className={H2}>Feito para quem trava pra começar</h2>
          <p className={`mt-4 mb-0 ${LEAD}`}>
            Pra quem sabe o que precisa fazer, mas não consegue dar o primeiro passo. Sem culpa e sem sermão.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className={`col-span-2 flex flex-col gap-6 p-8 ${CARD}`}>
            <div className="flex items-start gap-4">
              <span className={FEATURE_ICON}><i className="ph ph-battery-medium text-[24px]" /></span>
              <div>
                <h3 className="m-0 font-fredoka text-[20px]/[26px] font-semibold">Respeita a sua energia</h3>
                <p className="mt-1 mb-0 text-[16px]/[24px] text-tx2">Antes de começar, você conta como está. A rampa se ajusta.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ENERGY.map((e, i) => (
                <button
                  key={e.name}
                  type="button"
                  onClick={() => setEnergy(i)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-[16px] border-2 py-1.5 pr-3 pl-1.5 text-left text-tx ${
                    i === energy ? "border-pri bg-pri-soft" : "border-border bg-surface"
                  }`}
                >
                  <Broto size={44} mood={e.mood} />
                  <span className="flex min-w-0 flex-col">
                    <b className="text-[15px]/[20px] font-extrabold">{e.name}</b>
                    <span className="text-[12px]/[16px] font-semibold text-tx2">{e.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`flex flex-col gap-6 p-8 ${CARD}`}>
            <div className="flex items-start gap-4">
              <span className={FEATURE_ICON}><i className="ph ph-arrows-clockwise text-[24px]" /></span>
              <div>
                <h3 className="m-0 font-fredoka text-[20px]/[26px] font-semibold">Atrasou? Ele recalcula</h3>
                <p className="mt-1 mb-0 text-[16px]/[24px] text-tx2">O plano se refaz sozinho.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 rounded-[16px] border border-dashed border-border p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[13px]/[16px] font-bold text-tx2"><ObjDot color="bg-obj2" />Cálculo II</span>
                <span className="rounded-full bg-s2 px-[9px] py-[3px] text-[12px]/[16px] font-extrabold text-tx2">Reagendada</span>
              </div>
              <span className="font-fredoka text-[18px]/[24px] font-semibold text-tx2">Lista de integrais</span>
            </div>
            <div className="flex items-end gap-2">
              <Broto size={40} mood="ok" />
              <div className="flex-1 rounded-[20px_20px_20px_6px] border border-border bg-bg px-3.5 py-3 text-[15px]/[22px]">
                Tudo bem, recalculei pra você. Sobrou 1 dia de folga.
              </div>
            </div>
          </div>

          <div className={`flex flex-col gap-6 p-8 ${CARD}`}>
            <div className="flex items-start gap-4">
              <span className={FEATURE_ICON}><i className="ph ph-broom text-[24px]" /></span>
              <div>
                <h3 className="m-0 font-fredoka text-[20px]/[26px] font-semibold">Dia difícil também conta</h3>
                <p className="mt-1 mb-0 text-[16px]/[24px] text-tx2">Tarefas leves pra quando a energia tá baixa.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {TAREFAS.map((t, i) => {
                const on = done[i];
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
                    className="flex cursor-pointer items-center gap-3 rounded-[16px] border border-border bg-surface px-3.5 py-3 text-left text-tx"
                  >
                    <span
                      className={`box-border flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full border-2 text-pri-tx ${
                        on ? "border-pri bg-pri" : "border-border bg-transparent"
                      }`}
                    >
                      <i className={`ph-bold ph-check text-[14px] ${on ? "opacity-100" : "opacity-0"}`} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <b className={`text-[15px]/[20px] font-bold ${on ? "text-tx2 line-through" : "text-tx"}`}>{t.name}</b>
                      <span className="text-[12px]/[16px] font-semibold text-tx2">{t.meta}</span>
                    </span>
                    <span className="flex items-center gap-[3px] font-fredoka text-[14px]/none font-semibold">
                      <i className="ph-fill ph-drop text-[14px] text-blue-fill" />+3
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`col-span-2 flex flex-col gap-6 p-8 ${CARD}`}>
            <div className="flex items-start gap-4">
              <span className={FEATURE_ICON}><i className="ph ph-plant text-[24px]" /></span>
              <div>
                <h3 className="m-0 font-fredoka text-[20px]/[26px] font-semibold">O Broto cresce com você</h3>
                <p className="mt-1 mb-0 text-[16px]/[24px] text-pretty text-tx2">
                  Cada degrau rega o Broto e ele evolui com o seu nível. Num dia sem rega, só murcha um pouco. Nunca morre.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-5 items-end gap-3 text-center">
              {STAGES.map((s) => (
                <div key={s.stage} className="flex flex-col items-center gap-2">
                  <Broto size={88} stage={s.stage} />
                  <b className="font-fredoka text-[16px]/[20px] font-semibold">{s.name}</b>
                  <span className="text-[12px]/[16px] font-semibold text-tx2">{s.lv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* E-mail diário */}
      <section className="grid grid-cols-[minmax(0,1fr)_560px] items-center gap-24 px-[120px] pb-32">
        <div>
          <span className="text-[12px]/[16px] font-extrabold tracking-[.06em] text-tx2 uppercase">E-mail diário</span>
          <h2 className="mt-3 mb-0 font-fredoka text-[40px]/[48px] font-semibold text-balance">Seu dia já chega planejado</h2>
          <p className={`mt-4 mb-0 ${LEAD}`}>
            Toda manhã, um e-mail curto com o que fazer e quando. Um toque e você já está no primeiro degrau.
          </p>
          <div className="mt-8 flex flex-col gap-3.5">
            {["3 etapas com horário", "1 tarefa leve pra energia baixa", "Sua sequência de dias regados"].map((item) => (
              <span key={item} className="flex items-center gap-3 text-[16px]/[24px] font-bold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pri-soft text-pri">
                  <i className="ph-bold ph-check text-[14px]" />
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className={`overflow-hidden ${CARD}`}>
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-s2"><Broto size={32} /></span>
            <span className="flex flex-1 flex-col">
              <b className="text-[15px]/[20px] font-extrabold">Bora</b>
              <span className="text-[13px]/[18px] font-semibold text-tx2">Seu plano de hoje, Arthur</span>
            </span>
            <span className="text-[13px]/[18px] font-semibold text-tx2">07:00</span>
          </div>
          <div className="flex flex-col gap-5 p-8">
            <div className="flex items-center gap-3.5">
              <Broto size={56} mood="animado" />
              <div>
                <div className="font-fredoka text-[28px]/[36px] font-semibold">Seu plano de hoje, Arthur</div>
                <div className="text-[14px]/[20px] font-semibold text-tx2">Sexta, 6 de novembro</div>
              </div>
            </div>
            <div className="flex flex-col rounded-[16px] border border-border">
              {(
                [
                  ["10:00", "Lista de integrais", "bg-obj2", "Cálculo II · 45 min"],
                  ["14:00", "Diagrama de casos de uso", "bg-obj1", "Eng. Software · 1h30"],
                  ["17:30", "Escrever o case do app", "bg-obj3", "Portfólio · 30 min"],
                ] as const
              ).map(([time, title, dot, meta], i) => (
                <div key={time} className={`flex items-center gap-3 px-4 py-3.5 ${i < 2 ? "border-b border-border" : ""}`}>
                  <span className="w-14 rounded-full bg-blue-soft py-1 text-center text-[13px]/[16px] font-extrabold text-blue">{time}</span>
                  <span className="flex flex-1 flex-col">
                    <b className="text-[15px]/[20px] font-bold">{title}</b>
                    <span className="flex items-center gap-1.5 text-[12px]/[16px] font-semibold text-tx2"><ObjDot color={dot} />{meta}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-[16px] bg-s2 px-4 py-3">
              <i className="ph ph-broom text-[20px] text-tx2" />
              <span className="flex-1 text-[15px]/[20px] font-bold">
                Lavar a louça <span className="font-semibold text-tx2">· 10 min</span>
              </span>
              <span className="flex items-center gap-[3px] font-fredoka text-[14px]/none font-semibold">
                <i className="ph-fill ph-drop text-[14px] text-blue-fill" />+3
              </span>
            </div>
            <div className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-pri text-[16px]/none font-extrabold text-pri-tx shadow-[0_3px_0_var(--lip)]">
              <i className="ph-fill ph-play text-[16px]" />Vamos começar?
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[14px]/[20px] font-semibold text-tx2">
              <i className="ph-fill ph-leaf text-[18px] text-streak" />
              <b className="font-fredoka text-[16px]/none font-semibold text-tx">6</b>dias regados
            </div>
          </div>
        </div>
      </section>

      {/* Perguntas frequentes */}
      <section className="grid grid-cols-[400px_minmax(0,1fr)] items-start gap-24 px-[120px] pb-32">
        <div>
          <h2 className={H2}>Perguntas frequentes</h2>
          <p className={`mt-4 mb-0 ${LEAD.replace(" text-pretty", "")}`}>
            Não achou a sua? <a href="#" className="font-bold">Escreve pra gente.</a>
          </p>
        </div>
        <div className="flex flex-col border-t border-border">
          {FAQ.map((f, i) => {
            const open = faq === i;
            return (
              <div key={f.q} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setFaq((cur) => (cur === i ? -1 : i))}
                  className="flex min-h-20 w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent py-5 text-left text-tx"
                >
                  <span className="font-fredoka text-[20px]/[26px] font-semibold">{f.q}</span>
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-s2 text-tx">
                    <i className={`${open ? "ph-bold ph-minus" : "ph-bold ph-plus"} text-[16px]`} />
                  </span>
                </button>
                {open && <p className={`-mt-1 mb-0 pr-16 pb-6 ${LEAD}`}>{f.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA final (modo escuro) */}
      <section className="theme-dark bg-bg px-[120px] pt-24 text-tx">
        <div className="grid grid-cols-[minmax(0,1fr)_360px] items-center gap-16">
          <div>
            <h2 className="m-0 font-fredoka text-[64px]/[72px] font-bold tracking-[-0.01em] text-balance">
              Um degrau hoje. Uma árvore no fim do semestre.
            </h2>
            <p className={`mt-6 mb-0 max-w-[540px] ${LEAD}`}>
              Cada degrau cumprido rega o Broto. Comece pelo mais fácil, o resto a gente encaixa.
            </p>
            <a href="/cadastro" className={`mt-10 w-fit ${PRIMARY_BTN}`}>
              Começar grátis
              <i className="ph-bold ph-arrow-right text-[18px]" />
            </a>
          </div>
          <div className="flex justify-center pt-10">
            <Broto size={300} stage="arvore" mood="animado" />
          </div>
        </div>
        <footer className="mt-24 flex items-center justify-between border-t border-border pt-8 pb-10">
          <span className="flex items-center gap-2">
            <Broto size={32} />
            <b className="font-fredoka text-[22px]/none font-bold">bora</b>
          </span>
          <span className="text-[14px]/[20px] font-semibold text-tx2">© 2026 Bora</span>
        </footer>
      </section>
    </div>
  );
}
