// Anel de progresso do protótipo (trilha W22 e timer da rampa): viewBox 148, raio 64, traço 10.
interface ProgressRingProps {
  size: number;
  fraction: number;
  color: string;
  track: string;
  transition?: string;
}

const C = 402;

export default function ProgressRing({ size, fraction, color, track, transition = "stroke-dashoffset .6s" }: ProgressRingProps) {
  return (
    <svg viewBox="0 0 148 148" width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }} aria-hidden="true">
      <circle cx={74} cy={74} r={64} fill="none" stroke={track} strokeWidth={10} />
      {/* Sem progresso, sem traço: evita o ponto da ponta arredondada. */}
      {fraction > 0 && <circle
        cx={74}
        cy={74}
        r={64}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - Math.max(0, Math.min(1, fraction)))}
        style={{ transition }}
      />}
    </svg>
  );
}
