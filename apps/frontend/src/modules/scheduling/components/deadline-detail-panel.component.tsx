import { ICON_BTN, PRIMARY_BTN, objColor, objInk } from "@/modules/core/components/ui";
import { PANEL } from "./block-detail-panel.component";

// Detalhe do prazo em Prazos (AppCalendario.dc.html, hasSelObj): "Prazo final", etapas, tempo que falta,
// folga, próxima etapa e "Ver execução".
export interface DeadlineDetailView {
  title: string;
  colorIndex: number;
  progressPct: number;
  when: string;
  etapas: string;
  restante: string;
  folga: string;
  late: boolean;
  next: string;
}

interface DeadlineDetailPanelProps {
  detail: DeadlineDetailView;
  onClose: () => void;
  onVerExecucao: () => void;
}

export default function DeadlineDetailPanel({ detail: d, onClose, onVerExecucao }: DeadlineDetailPanelProps) {
  return (
    <aside className={PANEL}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px]/[16px] font-bold text-tx2">
          <i className="ph-fill ph-flag-checkered text-[16px]" style={{ color: objColor(d.colorIndex) }} />
          Prazo final
        </span>
        <button type="button" aria-label="Fechar" onClick={onClose} className={`${ICON_BTN} -my-2.5 -mr-2.5`}>
          <i className="ph ph-x text-[22px]" />
        </button>
      </div>
      <div>
        <h2 className="m-0 font-fredoka text-[28px]/[36px] font-semibold text-balance">{d.title}</h2>
        <span className="mt-1 block text-[14px]/[20px] font-semibold text-tx2">{d.when}</span>
      </div>
      <div className="flex flex-col gap-2 text-[14px]/[20px] font-bold">
        <span className="flex items-center gap-2"><i className="ph ph-list-checks text-[20px] text-tx2" />{d.etapas}</span>
        <span className="flex items-center gap-2"><i className="ph ph-clock text-[20px] text-tx2" />{d.restante}</span>
        <span className="flex items-center gap-2">
          <i className={`ph-bold ${d.late ? "ph-warning-circle text-danger" : "ph-check-circle text-pri"} text-[20px]`} />
          {d.folga}
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-[16px] border border-border bg-bg p-3.5">
        <span className="flex items-baseline justify-between">
          <b className="text-[14px]/[20px] font-extrabold">Concluído</b>
          <b className="font-fredoka text-[18px]/none font-semibold" style={{ color: objInk(d.colorIndex) }}>{d.progressPct}%</b>
        </span>
        <span className="h-2.5 overflow-hidden rounded-full bg-s2">
          <span className="block h-full rounded-full" style={{ width: `${d.progressPct}%`, background: objColor(d.colorIndex) }} />
        </span>
        <span className="flex items-center gap-1.5 text-[12px]/[16px] font-semibold text-tx2">
          <span className="h-2 w-2 rounded-full" style={{ background: objColor(d.colorIndex) }} />
          {d.next}
        </span>
      </div>
      <button type="button" onClick={onVerExecucao} className={PRIMARY_BTN}>
        <i className="ph-bold ph-puzzle-piece text-[18px]" />Ver execução
      </button>
    </aside>
  );
}
