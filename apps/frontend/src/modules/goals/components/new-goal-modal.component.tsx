"use client";

import { useState } from "react";
import { ApiError } from "@/modules/core/data/api-error";
import { ICON_BTN, KICKER, PRIMARY_BTN, SCRIM, SECONDARY_BTN } from "@/modules/core/components/ui";
import { formatDuration } from "@/modules/core/format/time.format";
import Broto from "@/modules/landing/components/broto.component";
import { goalsRepository, type CreateGoalResponse } from "../data";
import {
  ERROR_MESSAGES,
  addStep,
  changeMinutes,
  emptyGoalForm,
  removeStep,
  renameStep,
  toCreateGoalInput,
  totalMinutes,
  validateGoalForm,
} from "../logic/step-form.logic";

// Novo objetivo manual: a tela W30 (ModalNovoObjetivo.dc.html, "etapas sugeridas") começando vazia (P20).
// Adaptação intencional: sem "A IA achou", sem "analisando" e sem a prévia "Cabe até…", que dependem da IA
// e do motor do plano; o prazo vira um campo de data opcional (P3).
interface NewGoalModalProps {
  onClose: () => void;
  onCreated: (res: CreateGoalResponse) => void;
}

export default function NewGoalModal({ onClose, onCreated }: NewGoalModalProps) {
  const [form, setForm] = useState(emptyGoalForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const count = form.steps.length;

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
            <Broto size={56} mood="animado" />
            <div>
              <span className={KICKER}>Novo objetivo</span>
              <h2 className="mt-1 mb-0 font-fredoka text-[28px]/[36px] font-semibold">Quebrei em etapas pra você</h2>
            </div>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose} className={ICON_BTN}>
            <i className="ph ph-x text-[24px]" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-8 pt-5">
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
      </div>
    </div>
  );
}
