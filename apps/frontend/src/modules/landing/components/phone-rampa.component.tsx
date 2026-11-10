import Broto from "./broto.component";

// Mockup estático de celular, portado de design/web/source/PhoneRampa.dc.html (414×868).

const STEPS = [
  { name: "Aquecer", dur: "3 min", h: 108, state: "done", icon: "ph-bold ph-check" },
  { name: "Desafio", dur: "2 min", h: 127, state: "done", icon: "ph-bold ph-check" },
  { name: "Micro-passo", dur: "1 min", h: 146, state: "cur", icon: "ph-fill ph-footprints" },
  { name: "Foco", dur: "25 min", h: 165, state: "next", icon: "ph ph-timer" },
  { name: "Registrar", dur: "1 min", h: 184, state: "next", icon: "ph ph-check-circle" },
] as const;

const STEP_STYLE = {
  done: "bg-pri-soft text-pri",
  cur: "bg-pri text-pri-tx shadow-[0_3px_0_var(--lip)]",
  next: "bg-surface border border-border text-tx",
} as const;

export default function PhoneRampa() {
  return (
    <div className="box-border h-[868px] w-[414px] rounded-[60px] bg-phone-frame p-3 shadow-float">
      <div className="relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[48px] bg-bg font-nunito text-tx">
        <div className="absolute top-[11px] left-1/2 h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-phone-frame" />
        <div className="flex h-[54px] flex-none items-center justify-between pr-[30px] pl-[44px] text-[16px]/none font-bold">
          <span>9:41</span>
          <span className="flex gap-1.5 text-[17px]">
            <i className="ph-fill ph-cell-signal-full" />
            <i className="ph-bold ph-wifi-high" />
            <i className="ph-fill ph-battery-full" />
          </span>
        </div>
        <div className="box-content flex h-[52px] flex-none items-center justify-between px-5 pt-1">
          <div className="-ml-2.5 flex h-11 w-11 items-center justify-center rounded-full text-tx2">
            <i className="ph ph-x text-[24px]" />
          </div>
          <div className="flex items-center gap-1.5">
            <Broto size={40} mood="ok" />
            <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
              <span className="flex items-center gap-1 px-2.5 py-1.5">
                <i className="ph-fill ph-leaf text-[18px] text-streak" />
                <b className="font-fredoka text-[16px]/none font-semibold">6</b>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1.5">
                <i className="ph-fill ph-drop text-[18px] text-blue-fill" />
                <b className="font-fredoka text-[16px]/none font-semibold">340</b>
              </span>
              <span className="flex items-center gap-2 rounded-full bg-s2 py-1.5 pr-3 pl-2.5">
                <b className="font-fredoka text-[14px]/none font-semibold text-pri">Nv 7</b>
                <span className="h-1.5 w-9 overflow-hidden rounded-full bg-border">
                  <span className="block h-full w-[70%] bg-fill" />
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="px-5 pt-5">
          <div className="flex items-center gap-2 text-[12px]/[16px] font-extrabold tracking-[.06em] text-tx2 uppercase">
            <span className="h-2 w-2 rounded-full bg-obj1" />
            Rampa · Eng. Software
          </div>
          <div className="mt-2 mb-1 font-fredoka text-[26px]/[32px] font-semibold">
            Diagrama de casos de uso
          </div>
          <div className="text-[14px]/[20px] font-semibold text-tx2">Rampa de 25 min até o foco</div>
        </div>
        <div className="mx-5 mt-6 flex h-[184px] items-end gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.name}
              style={{ height: s.h }}
              className={`box-border flex min-w-0 flex-1 flex-col gap-0.5 rounded-[16px_16px_8px_8px] px-1.5 py-2.5 ${STEP_STYLE[s.state]}`}
            >
              <i className={`${s.icon} mb-1 text-[22px]`} />
              <span className="text-[13px]/[16px] font-extrabold">{s.name}</span>
              <span className="text-[12px]/[16px] font-semibold opacity-85">{s.dur}</span>
              <span className="flex items-center gap-0.5 font-fredoka text-[12px]/[16px] font-semibold">
                <i className={`ph-fill ph-drop text-[12px] ${s.state === "next" ? "text-blue-fill" : ""}`} />
                +5
              </span>
            </div>
          ))}
        </div>
        <div className="mx-5 mt-3.5 flex items-center justify-between">
          <span className="text-[14px]/[20px] font-bold">Degrau 3 de 5 · Micro-passo</span>
          <span className="-mr-2.5 flex gap-0.5">
            <span className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[14px]/none font-extrabold text-blue">
              <i className="ph-bold ph-arrows-clockwise text-[16px]" />
              Trocar
            </span>
            <span className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[14px]/none font-extrabold text-blue">
              Pular
              <i className="ph-bold ph-skip-forward text-[16px]" />
            </span>
          </span>
        </div>
        <div className="mx-5 mt-4 flex flex-col gap-2.5 rounded-[16px] border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[12px]/[16px] font-extrabold tracking-[.06em] text-tx2 uppercase">
              Micro-passo · 1 min
            </span>
            <span className="rounded-full bg-pri px-[9px] py-[3px] text-[12px]/[16px] font-extrabold text-pri-tx">
              Agora
            </span>
          </div>
          <div className="font-fredoka text-[20px]/[26px] font-semibold">
            Abra o arquivo e escreva o nome de 3 atores do sistema.
          </div>
          <div className="text-[14px]/[20px] font-semibold text-tx2">Só isso. O desenho fica pro foco.</div>
        </div>
        <div className="flex-1" />
        <div className="px-5">
          <div className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-pri text-[16px]/none font-extrabold text-pri-tx shadow-[0_3px_0_var(--lip)]">
            Concluí o degrau
            <i className="ph-bold ph-check text-[16px]" />
          </div>
        </div>
        <div className="mx-auto mt-[22px] mb-2 h-[5px] w-[134px] rounded-full bg-phone-frame" />
      </div>
    </div>
  );
}
