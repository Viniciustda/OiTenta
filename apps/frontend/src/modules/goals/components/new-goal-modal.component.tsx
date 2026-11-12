"use client";

import { useState } from "react";
import { ApiError } from "@/modules/core/data/api-error";
import { ICON_BTN, KICKER, PRIMARY_BTN, SCRIM, SECONDARY_BTN, TERTIARY_BTN } from "@/modules/core/components/ui";
import { formatDuration } from "@/modules/core/format/time.format";
import Broto, { type BrotoMood } from "@/modules/landing/components/broto.component";
import { goalAssistantRepository, goalsRepository, type CreateGoalResponse } from "../data";
import {
  ERROR_MESSAGES,
  addStep,
  changeMinutes,
  emptyGoalForm,
  formFromDraft,
  removeStep,
  renameStep,
  toCreateGoalInput,
  totalMinutes,
  validateGoalForm,
} from "../logic/step-form.logic";

// Novo objetivo (ModalNovoObjetivo.dc.html): W27 (Escrever / Colar link) → W29 ("IA analisando…") →
// W30 preenchida pelo rascunho da IA (IA1). Se a IA falha, ou pelo "Prefiro preencher à mão" (IA3,
// provisório, fora do protótipo), a W30 abre vazia: o objetivo manual (P20, 4f).
// Adaptações intencionais na W30: "A IA achou" só com requisitos (o contrato não traz o chip "entrega");
// sem a prévia "Cabe até…", que depende do motor do plano; o prazo é um campo de data opcional (P3).
// A aba "Colar link" (W28) é só visual até a decisão sobre o UC03.
interface NewGoalModalProps {
  onClose: () => void;
  onCreated: (res: CreateGoalResponse) => void;
}

type Phase = "input" | "analyzing" | "result";
type Tab = "text" | "link";

const HEADER: Record<Phase, { step: string; heading: string; mood: BrotoMood }> = {
  input: { step: "1 de 3", heading: "Me conta o que você precisa entregar", mood: "ok" },
  analyzing: { step: "2 de 3", heading: "Lendo o enunciado…", mood: "focado" },
  result: { step: "3 de 3", heading: "Quebrei em etapas pra você", mood: "animado" },
};

const tabClass = (active: boolean) =>
  `flex h-10 cursor-pointer items-center gap-2 rounded-full border px-[18px] text-[14px]/none font-extrabold text-tx ${
    active ? "border-border bg-surface" : "border-transparent bg-transparent"
  }`;

/** Skeleton do "IA analisando…" (W29), com o brilho do protótipo. */
const SHIMMER =
  "animate-[shimmer_1.4s_infinite] bg-[linear-gradient(90deg,var(--s2)_25%,var(--border)_50%,var(--s2)_75%)] bg-[length:200%_100%]";

export default function NewGoalModal({ onClose, onCreated }: NewGoalModalProps) {
  const [phase, setPhase] = useState<Phase>("input");
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [form, setForm] = useState(emptyGoalForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const count = form.steps.length;
  const header = HEADER[phase];
  const canAnalyze = tab === "text" && text.trim().length > 0;

  const analisar = async () => {
    if (!canAnalyze) return;
    setPhase("analyzing");
    try {
      const { draft } = await goalAssistantRepository.draft(text.trim());
      setForm(formFromDraft(draft));
    } catch {
      // 503, outro erro HTTP, rede ou timeout: formulário manual (4f).
      setForm(emptyGoalForm());
    }
    setPhase("result");
  };

  const preencherAMao = () => {
    setForm(emptyGoalForm());
    setPhase("result");
  };

  const encaixar = async () => {
    const errors = validateGoalForm(form);
    if (errors.length) {
      setError(ERROR_MESSAGES[errors[0]]);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      onCreated(await goalsRepository.create(toCreateGoalInput(form)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Algo deu errado. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] box-border flex animate-[fadeIn_.2s] items-center justify-center p-8 ${SCRIM}`}>
      <div role="dialog" aria-label="Novo objetivo" className="box-border flex max-h-full w-[960px] animate-[riseIn_.3s_cubic-bezier(.3,1.4,.5,1)] max-w-full flex-col overflow-auto rounded-[24px] border border-border bg-surface">
        <div className="flex items-start justify-between gap-4 pt-6 pr-6 pl-8">
          <div className="flex items-center gap-3.5">
            <Broto size={56} mood={header.mood} />
            <div>
              <span className={KICKER}>{`Novo objetivo · ${header.step}`}</span>
              <h2 className="mt-1 mb-0 font-fredoka text-[28px]/[36px] font-semibold">{header.heading}</h2>
            </div>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose} className={ICON_BTN}>
            <i className="ph ph-x text-[24px]" />
          </button>
        </div>

        {phase === "input" && (
          <div className="flex flex-col gap-5 px-8 pt-6 pb-8">
            <div className="flex w-fit gap-1 rounded-full bg-s2 p-1">
              <button type="button" aria-pressed={tab === "text"} onClick={() => setTab("text")} className={tabClass(tab === "text")}>
                <i className="ph-bold ph-pencil-simple text-[16px]" />Escrever
              </button>
              <button type="button" aria-pressed={tab === "link"} onClick={() => setTab("link")} className={tabClass(tab === "link")}>
                <i className="ph-bold ph-link text-[16px]" />Colar link
              </button>
            </div>
            {tab === "text" ? (
              <label htmlFor="goal-text" className="flex flex-col gap-2">
                <span className="text-[14px]/[20px] font-extrabold">O que você precisa entregar?</span>
                <textarea
                  id="goal-text"
                  value={text}
                  maxLength={2000}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="trabalho de Engenharia de Software para dia 20"
                  className="box-border min-h-[140px] resize-y rounded-[12px] border-2 border-blue bg-surface px-4 py-3.5 text-[18px]/[26px] text-tx outline-0"
                />
              </label>
            ) : (
              <label htmlFor="goal-link" className="flex flex-col gap-2">
                <span className="text-[14px]/[20px] font-extrabold">Link da atividade</span>
                <span className="box-border flex h-[52px] items-center gap-2.5 rounded-[12px] border-2 border-blue bg-surface px-3.5">
                  <i className="ph ph-link text-[20px] text-blue" />
                  <input
                    id="goal-link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent text-[15px]/none font-semibold text-ellipsis text-tx outline-0"
                  />
                </span>
              </label>
            )}
            <p className="m-0 text-[14px]/[20px] font-semibold text-tx2">
              Escreve do seu jeito. Eu acho o prazo, os requisitos e quebro em etapas que cabem nos seus horários.
            </p>
            <div className="flex flex-col items-end gap-2">
              <button type="button" disabled={!canAnalyze} onClick={analisar} className={PRIMARY_BTN}>
                <i className="ph-bold ph-sparkle text-[18px]" />Analisar com IA
              </button>
              <button type="button" onClick={preencherAMao} className={TERTIARY_BTN}>
                <i className="ph-bold ph-pencil-simple text-[16px]" />Prefiro preencher à mão
              </button>
            </div>
          </div>
        )}

        {phase === "analyzing" && (
          <div className="flex flex-col gap-4 px-8 pt-6 pb-10">
            <div className="flex flex-col gap-3 rounded-[16px] border border-border bg-bg p-5">
              <span className="flex items-center gap-2 text-[15px]/[20px] font-extrabold text-blue">
                <i className="ph-bold ph-circle-notch animate-spin text-[18px]" />IA analisando…
              </span>
              <span className={`h-2.5 w-[80%] rounded-full ${SHIMMER}`} />
              <span className={`h-2.5 w-[56%] rounded-full ${SHIMMER}`} />
              <span className="flex gap-1.5">
                <span className="h-6 w-24 rounded-full bg-s2" />
                <span className="h-6 w-[72px] rounded-full bg-s2" />
                <span className="h-6 w-[110px] rounded-full bg-s2" />
              </span>
            </div>
            {[1, 0.8, 0.6, 0.4].map((opacity) => (
              <span key={opacity} style={{ opacity }} className={`h-14 rounded-[16px] ${SHIMMER}`} />
            ))}
          </div>
        )}

        {phase === "result" && (
          <>
            <div className="flex animate-[riseIn_.3s] flex-col gap-5 px-8 pt-5">
              <div className="grid grid-cols-[minmax(0,1fr)_200px] gap-4">
                <label htmlFor="goal-title" className="flex flex-col gap-1.5">
                  <span className="text-[13px]/[16px] font-extrabold">Objetivo</span>
                  <span className="box-border flex h-[52px] items-center gap-2.5 rounded-[12px] border-2 border-border bg-surface px-3.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-obj4" />
                    <input
                      id="goal-title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="min-w-0 flex-1 border-0 bg-transparent text-[16px]/none font-bold text-tx outline-0"
                    />
                  </span>
                </label>
                <label htmlFor="goal-deadline" className="flex flex-col gap-1.5">
                  <span className="text-[13px]/[16px] font-extrabold">Entrega</span>
                  <span className="box-border flex h-[52px] items-center gap-2.5 rounded-[12px] border-2 border-border bg-surface px-3.5">
                    <i className="ph ph-flag-checkered text-[20px] text-tx2" />
                    <input
                      id="goal-deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="min-w-0 flex-1 border-0 bg-transparent text-[16px]/none font-bold text-tx outline-0"
                    />
                  </span>
                </label>
              </div>

              {form.requirements.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 flex items-center gap-1.5 text-[14px]/[20px] font-extrabold text-blue">
                    <i className="ph-bold ph-sparkle text-[16px]" />A IA achou
                  </span>
                  {form.requirements.map((r) => (
                    <span key={r} className="flex h-7 items-center rounded-full bg-s2 px-2.5 text-[13px]/none font-bold">{r}</span>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className={KICKER}>
                    {count} {count === 1 ? "etapa" : "etapas"} · edite o que quiser
                  </span>
                  <span className="text-[14px]/[20px] font-bold text-tx2">
                    Total <b className="font-fredoka text-[20px]/none font-semibold text-tx">{formatDuration(totalMinutes(form.steps))}</b>
                  </span>
                </div>
                {form.steps.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-3 rounded-[16px] border border-border bg-surface py-2 pr-2 pl-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-s2 font-fredoka text-[14px]/none font-semibold text-tx2">{i + 1}</span>
                    <input
                      aria-label={`Etapa ${i + 1}`}
                      value={s.title}
                      onChange={(e) => setForm(renameStep(form, s.key, e.target.value))}
                      className="h-10 min-w-0 flex-1 rounded-[12px] border-2 border-transparent bg-transparent px-2.5 text-[15px]/none font-bold text-tx outline-0 focus:border-blue focus:bg-surface"
                    />
                    <span className="flex items-center gap-0.5 rounded-full bg-s2 p-0.5">
                      <button type="button" aria-label="Menos 15 min" onClick={() => setForm(changeMinutes(form, s.key, -15))} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-transparent text-tx">
                        <i className="ph-bold ph-minus text-[14px]" />
                      </button>
                      <b className="min-w-[58px] text-center font-fredoka text-[16px]/none font-semibold tabular-nums">{formatDuration(s.minutes)}</b>
                      <button type="button" aria-label="Mais 15 min" onClick={() => setForm(changeMinutes(form, s.key, 15))} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-transparent text-tx">
                        <i className="ph-bold ph-plus text-[14px]" />
                      </button>
                    </span>
                    <button type="button" aria-label="Remover etapa" onClick={() => setForm(removeStep(form, s.key))} className={ICON_BTN}>
                      <i className="ph ph-trash text-[20px]" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setForm(addStep(form))} className="flex h-11 cursor-pointer items-center gap-1.5 self-start rounded-full bg-transparent px-3.5 text-[15px]/none font-extrabold text-blue hover:bg-blue-soft">
                  <i className="ph-bold ph-plus text-[16px]" />Adicionar etapa
                </button>
              </div>
            </div>

            <div className="sticky bottom-0 mt-3 flex items-center justify-between gap-4 border-t border-border bg-surface px-8 pt-4 pb-6">
              <span className="flex items-center gap-2 text-[15px]/[22px] font-bold">
                {error && (
                  <>
                    <i className="ph-bold ph-warning-circle text-[20px] text-danger" />
                    <span role="alert" className="text-danger">{error}</span>
                  </>
                )}
              </span>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className={SECONDARY_BTN}>Voltar</button>
                <button type="button" disabled={saving} onClick={encaixar} className={PRIMARY_BTN}>
                  <i className="ph-bold ph-calendar-plus text-[18px]" />Encaixar no meu calendário
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
