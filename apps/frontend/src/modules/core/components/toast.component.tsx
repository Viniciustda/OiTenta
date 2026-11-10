// Toast do protótipo (Bora App.dc.html): pílula escura no topo, centrada na área ao lado da sidebar.
export interface ToastData {
  title: string;
  sub: string;
  icon: "drop" | "plant";
}

export default function Toast({ toast }: { toast: ToastData }) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed top-6 left-[calc(50%+120px)] z-[80] flex -translate-x-1/2 items-center gap-3 rounded-full bg-tx py-2.5 pr-5 pl-2.5 whitespace-nowrap text-bg shadow-float"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-toast-icon-bg">
        <i className={`ph-fill ph-${toast.icon} text-[20px] ${toast.icon === "drop" ? "text-toast-icon" : "text-fill"}`} />
      </span>
      <span className="flex flex-col">
        <b className="font-fredoka text-[18px]/[22px] font-bold">{toast.title}</b>
        <span className="text-[12px]/[16px] font-semibold opacity-80">{toast.sub}</span>
      </span>
    </div>
  );
}
