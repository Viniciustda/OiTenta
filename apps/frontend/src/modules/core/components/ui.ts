// Classes Tailwind repetidas nas telas do web app (Bora App.dc.html). Cores só por tokens.
export const KICKER = "text-[12px]/[16px] font-extrabold tracking-[.06em] uppercase text-tx2";
export const CARD = "rounded-[16px] border border-border bg-surface shadow-card";
export const PRIMARY_BTN =
  "flex h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-pri px-7 text-[16px]/none font-extrabold text-pri-tx shadow-[0_3px_0_var(--lip)] transition-[transform,box-shadow] duration-[80ms] active:translate-y-[3px] active:shadow-none active:brightness-[.94] disabled:cursor-not-allowed";
export const SECONDARY_BTN =
  "flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-border bg-surface px-5 text-[16px]/none font-extrabold text-blue shadow-[0_3px_0_var(--border)] transition-[transform,box-shadow] duration-[80ms] active:translate-y-[3px] active:bg-s2 active:shadow-none";
export const TERTIARY_BTN =
  "flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[14px]/none font-extrabold text-blue hover:bg-blue-soft";
export const ICON_BTN =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-tx2 hover:bg-s2";
/** Fundo escurecido dos modais: --tx a 40% (o protótipo usa --scrim, ainda não está no globals.css). */
export const SCRIM = "bg-[color-mix(in_srgb,var(--tx)_40%,transparent)]";

/** Cor do objetivo pelo índice (P4): --obj1…--obj4. O --obj4 ainda falta no globals.css. */
export const objColor = (colorIndex: number) => `var(--obj${colorIndex})`;
/** Cor do texto do % de cada objetivo (protótipo: verde, azul, verde, texto). */
export const objInk = (colorIndex: number) =>
  colorIndex === 2 ? "var(--blue)" : colorIndex === 4 ? "var(--tx)" : "var(--pri)";
