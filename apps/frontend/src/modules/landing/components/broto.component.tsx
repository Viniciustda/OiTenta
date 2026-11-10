// Mascote Broto, portado de design/web/source/Broto.dc.html.
// O desenho é o mesmo do protótipo; as cores vêm dos tokens --broto-* do CSS global.

export type BrotoStage = "semente" | "broto" | "muda" | "arbusto" | "arvore";
export type BrotoMood =
  | "ok"
  | "sonolento"
  | "animado"
  | "focado"
  | "preocupado"
  | "comemorando"
  | "murcho";

interface BrotoProps {
  size?: number;
  stage?: BrotoStage;
  mood?: BrotoMood;
  wave?: boolean;
}

const STAGES: Record<BrotoStage, number> = {
  semente: 1,
  broto: 2,
  muda: 3,
  arbusto: 4,
  arvore: 5,
};

function build(st: number, mood: BrotoMood, wave: boolean): string {
  const INK = "var(--broto-ink)";
  const wilt = mood === "murcho";
  const B = wilt ? "var(--broto-body-wilt)" : "var(--broto-body)";
  const S = wilt ? "var(--broto-shade-wilt)" : "var(--broto-shade)";
  const L = wilt ? "var(--broto-leaf-wilt)" : "var(--broto-leaf)";
  const T = "var(--broto-stem)";
  const BL = "var(--broto-blue)";
  const droop = mood === "sonolento" || wilt;
  const ln = (d: string, w = 2.6, c = INK) =>
    `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const el = (cx: number, cy: number, rx: number, ry: number, f = INK) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"/>`;
  const c = (cx: number, cy: number, r: number, f: string) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
  const rl = `<path d="M60 36 C60 24 70 17 83 19 C81 32 71 38 60 36 Z" fill="${L}"/><path d="M63 33 C67 29 73 25 79 22" fill="none" stroke="${T}" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>`;
  const R = droop ? `<g transform="rotate(38 60 36)">${rl}</g>` : rl;
  const ll = `<path d="M60 38 C58 28 49 23 39 25 C41 36 50 40 60 38 Z" fill="${L}"/>`;
  const Lf = droop ? `<g transform="rotate(-38 60 38)">${ll}</g>` : ll;
  let plant = "";
  if (st === 1)
    plant = `<path d="M60 48 C60 41 64 38 70 39 C69 45 65 48 60 48 Z" fill="${L}"/>`;
  if (st === 2) plant = ln("M60 47 L60 36", 3.5, T) + R;
  if (st === 3)
    plant =
      ln("M60 47 L60 28", 3.5, T) + `<g transform="translate(0 -8)">${R}</g>` + Lf;
  if (st === 4)
    plant =
      c(40, 46, 16, S) +
      c(80, 46, 16, S) +
      c(60, 32, 19, S) +
      c(48, 37, 11, L) +
      c(72, 39, 10, L) +
      c(60, 24, 8, L);
  if (st === 5) {
    plant =
      `<rect x="56" y="26" width="8" height="26" rx="3" fill="${T}"/>` +
      c(36, 34, 17, S) +
      c(84, 34, 17, S) +
      c(60, 20, 21, S) +
      c(48, 26, 12, L) +
      c(73, 28, 11, L) +
      c(60, 40, 9, L);
    (
      [
        [34, 30],
        [56, 8],
        [84, 26],
        [72, 42],
        [44, 44],
        [24, 40],
      ] as const
    ).forEach(([x, y]) => {
      plant += c(x, y, 3.8, BL) + c(x, y, 1.4, "var(--broto-sparkle)");
    });
  }
  if (wave && plant)
    plant = `<g class="broto-wave" style="transform-origin:60px 48px;transform-box:view-box;animation:brotoWave 3s ease-in-out infinite">${plant}</g>`;
  const body = `<path d="M60 46 C84 46 94 68 94 82 C94 100 79 108 60 108 C41 108 26 100 26 82 C26 68 36 46 60 46 Z" fill="${B}"/><path d="M27 90 C33 103 47 108 60 108 C78 108 91 101 93 88 C83 100 46 104 27 90 Z" fill="${S}"/><path d="M44 59 C44 59 39 65 39 68.5 A5 5 0 0 0 49 68.5 C49 65 44 59 44 59 Z" fill="var(--broto-drop)"/>`;
  let face = "";
  let extra = "";
  switch (mood) {
    case "sonolento":
      face =
        ln("M45.5 83 Q50 86.5 54.5 83") +
        ln("M65.5 83 Q70 86.5 74.5 83") +
        c(60, 94, 1.8, INK);
      extra = `<text x="88" y="58" font-family="var(--font-fredoka), sans-serif" font-weight="700" font-size="14" fill="var(--broto-zzz)">z</text><text x="98" y="46" font-family="var(--font-fredoka), sans-serif" font-weight="700" font-size="10" fill="var(--broto-zzz)">z</text>`;
      break;
    case "animado":
      face =
        el(50, 82, 4.6, 6.2) +
        el(70, 82, 4.6, 6.2) +
        c(51.6, 79.4, 1.7, "var(--broto-highlight)") +
        c(71.6, 79.4, 1.7, "var(--broto-highlight)") +
        `<path d="M55.5 90.5 Q60 97.5 64.5 90.5 Z" fill="${INK}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
      extra =
        ln("M95 50 L105 50 M100 45 L100 55", 2.6, BL) +
        ln("M13 63 L23 63 M18 58 L18 68", 2.6, BL);
      break;
    case "focado":
      face =
        el(50, 83, 3.2, 4.2) +
        el(70, 83, 3.2, 4.2) +
        ln("M57 95 L63 95", 2.2) +
        `<circle cx="50" cy="82" r="8.5" fill="var(--broto-glass)" stroke="${INK}" stroke-width="2.4"/><circle cx="70" cy="82" r="8.5" fill="var(--broto-glass)" stroke="${INK}" stroke-width="2.4"/>` +
        ln("M58.5 81 Q60 79.5 61.5 81", 2.4);
      break;
    case "preocupado":
      face =
        el(50, 83, 3.8, 5.2) +
        el(70, 83, 3.8, 5.2) +
        ln("M55 95 Q57.5 93 60 95 Q62.5 97 65 95", 2.2) +
        ln("M44 74 L54 71") +
        ln("M66 71 L76 74") +
        `<path d="M93 62 C93 62 88.5 68 88.5 70.5 A4.5 4.5 0 0 0 97.5 70.5 C97.5 68 93 62 93 62 Z" fill="${BL}"/>`;
      break;
    case "comemorando":
      face =
        ln("M45.5 84 Q50 78 54.5 84", 2.8) +
        ln("M65.5 84 Q70 78 74.5 84", 2.8) +
        `<path d="M55 90 Q60 98.5 65 90 Z" fill="${INK}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
      (
        [
          [18, 52, -20, "var(--broto-confetti-amber)"],
          [100, 48, 25, BL],
          [28, 30, 40, "var(--broto-leaf)"],
          [92, 28, -30, "var(--broto-confetti-amber)"],
          [12, 80, 15, BL],
          [106, 76, -15, "var(--broto-leaf)"],
        ] as const
      ).forEach(([x, y, r, f]) => {
        extra += `<rect x="${x - 3.5}" y="${y - 2}" width="7" height="4" rx="1.5" fill="${f}" transform="rotate(${r} ${x} ${y})"/>`;
      });
      break;
    case "murcho":
      face =
        el(50, 84, 3.6, 3.4) + el(70, 84, 3.6, 3.4) + ln("M56.5 95 Q60 92.5 63.5 95", 2.2);
      break;
    default:
      face = el(50, 82, 4, 5.5) + el(70, 82, 4, 5.5) + ln("M57 92.5 Q60 95 63 92.5", 2.2);
  }
  let fig = plant + body + face;
  if (st === 1)
    fig = `<g transform="translate(60 108) scale(.82) translate(-60 -108)">${fig}</g>`;
  const lift =
    mood === "animado" || mood === "comemorando" ? "translate(0 -4)" : "translate(0 0)";
  return `<svg viewBox="0 0 120 120" width="100%" height="100%" style="overflow:visible;display:block" aria-hidden="true"><ellipse cx="60" cy="112" rx="${st === 1 ? 24 : 30}" ry="4" fill="var(--broto-ground)"/><g transform="${lift}">${fig}</g>${extra}</svg>`;
}

export default function Broto({
  size = 120,
  stage = "broto",
  mood = "ok",
  wave = false,
}: BrotoProps) {
  return (
    <span
      role="img"
      aria-label="Broto"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        lineHeight: 0,
        verticalAlign: "middle",
        flex: "none",
      }}
      dangerouslySetInnerHTML={{ __html: build(STAGES[stage], mood, wave) }}
    />
  );
}
