import { ICON_BTN, PRIMARY_BTN, SECONDARY_BTN, objColor, objInk } from "@/modules/core/components/ui";
import type { GoalListItem } from "@/modules/goals/data";
import { goalMeta } from "@/modules/today/logic/today.logic";
import type { PlanBlock } from "../data";
import { blockDetail } from "../logic/calendar.logic";

// W16 detalhe do bloco, só leitura. Sem ação nesta fase: Mover, Marcar parcial, Não vou conseguir.
interface BlockDetailPanelProps {
  block: PlanBlock;
  goal: GoalListItem | undefined;
  /** Partes pendentes da mesma etapa, em ordem. */
  parts: PlanBlock[];
  today: string;
  tz: string;
  onClose: () => void;
  onStart: () => void;
}

export const PANEL = "sticky top-6 box-border flex w-[360px] animate-[riseIn_.25s] flex-none flex-col gap-4 rounded-[16px] border border-border bg-surface p-5 shadow-[0_8px_24px_color-mix(in_srgb,var(--tx)_10%,transparent)]";

export default function BlockDetailPanel({ block, goal, parts, today, tz, onClose, onStart }: BlockDetailPanelProps) {
  const detail = blockDetail(block, today, tz);
  const partLabel = block.status === "done" ? "Concluída" : parts.length > 1 ? `Parte ${parts.findIndex((p) => p.id === block.id) + 1} de ${parts.length} desta etapa` : "Etapa inteira";
  return (
    <aside className={PANEL}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px]/[16px] font-bold text-tx2">
          <span className="h-2 w-2 rounded-full" style={{ background: objColor(block.colorIndex) }} />
          {block.goalTitle}
        </span>
        <button type="button" aria-label="Fechar" onClick={onClose} className={`${ICON_BTN} -my-2.5 -mr-2.5`}>
          <i className="ph ph-x text-[22px]" />
        </button>
      </div>
      <div>
        <h2 className="m-0 font-fredoka text-[28px]/[36px] font-semibold text-balance">{block.stepTitle}</h2>
        <span className="mt-1 block text-[14px]/[20px] font-semibold text-tx2">{partLabel}</span>
      </div>
      <div className="flex flex-col gap-2 text-[14px]/[20px] font-bold">
        <span className="flex items-center gap-2"><i className="ph ph-calendar-blank text-[20px] text-tx2" />{detail.when}</span>
        <span className="flex items-center gap-2"><i className="ph ph-clock text-[20px] text-tx2" />{detail.duration}</span>
        <span className="flex items-center gap-2"><i className="ph-fill ph-drop text-[20px] text-blue-fill" />+20 gotas ao concluir</span>
      </div>
      {goal && (
        <div className="flex flex-col gap-2 rounded-[16px] border border-border bg-bg p-3.5">
          <span className="flex items-baseline justify-between">
            <b className="text-[14px]/[20px] font-extrabold">{goal.title}</b>
            <b className="font-fredoka text-[18px]/none font-semibold" style={{ color: objInk(goal.colorIndex) }}>{goal.progressPct}%</b>
          </span>
          <span className="h-2.5 overflow-hidden rounded-full bg-s2">
            <span className="block h-full rounded-full" style={{ width: `${goal.progressPct}%`, background: objColor(goal.colorIndex) }} />
          </span>
          <span className="flex items-center gap-1.5 text-[12px]/[16px] font-semibold text-tx2">
            <i className="ph-bold ph-check-circle text-[14px] text-pri" />
            {goalMeta(goal)}
          </span>
        </div>
      )}
      {block.status === "done" ? (
        <span className="flex items-center gap-2 rounded-[16px] bg-pri-soft px-3.5 py-3 text-[15px]/[20px] font-extrabold text-pri">
          <i className="ph-bold ph-check text-[16px]" />Etapa concluída
        </span>
      ) : (
        <div className="flex flex-col gap-3">
          <button type="button" onClick={onStart} className={PRIMARY_BTN}>
            <i className="ph-fill ph-play text-[18px]" />Começar agora
          </button>
          <button type="button" className={SECONDARY_BTN}>
            <i className="ph-bold ph-arrows-out-cardinal text-[18px]" />Mover
          </button>
          <div className="flex gap-1">
            <button type="button" className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-transparent text-[15px]/none font-extrabold text-blue hover:bg-blue-soft">
              <i className="ph-bold ph-circle-half text-[16px]" />Marcar parcial
            </button>
            <button type="button" className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-transparent text-[15px]/none font-extrabold text-blue hover:bg-blue-soft">
              <i className="ph-bold ph-calendar-x text-[16px]" />Não vou conseguir
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
