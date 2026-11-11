import { describe, expect, it } from "vitest";
import type { RampResponse, RampStepKind } from "../data/activation.types";
import { createRampState, rampReducer, currentOption, stepIndexOf } from "./ramp.logic";

const opt = (stepKind: RampStepKind, title: string, sec: number) => ({ id: title, stepKind, title, durationLabel: `${sec / 60} min`, durationSeconds: sec, description: "", icon: "x" });
const ramp: RampResponse = {
  suggested: "warmup",
  steps: [
    { kind: "warmup", options: [opt("warmup", "Aquecer A", 180), opt("warmup", "Aquecer B", 180)] },
    { kind: "challenge", options: [opt("challenge", "Desafio A", 120), opt("challenge", "Desafio B", 120)] },
    { kind: "micro", options: [opt("micro", "Micro A", 60)] },
    { kind: "focus", options: [opt("focus", "25 min", 1500)] },
    { kind: "log", options: [] },
  ],
};

describe("rampa (W32–W41)", () => {
  it("começa no degrau sugerido, com o tempo da primeira opção", () => {
    const s = createRampState({ ...ramp, suggested: "challenge" });
    expect(s.stepIndex).toBe(1);
    expect(s.remainingSeconds).toBe(120);
    expect(s.phase).toBe("ramp");
    expect(stepIndexOf("focus")).toBe(3);
  });

  it("opção sem durationSeconds (opcional no domínio) usa 1 min", () => {
    const sem = { ...ramp, steps: ramp.steps.map((st) => ({ ...st, options: st.options.map((o) => ({ ...o, durationSeconds: undefined })) })) };
    expect(createRampState(sem).remainingSeconds).toBe(60);
  });

  it("Concluí o degrau avança, conta o degrau e reinicia o tempo", () => {
    const s = rampReducer(createRampState(ramp), { type: "complete" }, ramp);
    expect(s.stepIndex).toBe(1);
    expect(s.completedSteps).toBe(1);
    expect(s.remainingSeconds).toBe(120);
  });

  it("Pular avança sem contar o degrau", () => {
    const s = rampReducer(createRampState(ramp), { type: "skip" }, ramp);
    expect(s.stepIndex).toBe(1);
    expect(s.completedSteps).toBe(0);
  });

  it("Trocar mostra a próxima opção do degrau e volta à primeira no fim (W33)", () => {
    let s = rampReducer(createRampState(ramp), { type: "swap" }, ramp);
    expect(currentOption(s, ramp)?.title).toBe("Aquecer B");
    s = rampReducer(s, { type: "swap" }, ramp);
    expect(currentOption(s, ramp)?.title).toBe("Aquecer A");
  });

  it("o tempo corre com a velocidade da demo e o degrau termina sozinho", () => {
    let s = rampReducer(createRampState(ramp), { type: "setSpeed", speed: 60 }, ramp);
    s = rampReducer(s, { type: "tick", seconds: 1 }, ramp);
    expect(s.remainingSeconds).toBe(120);
    s = rampReducer(s, { type: "tick", seconds: 2 }, ramp);
    expect(s.stepIndex).toBe(1);
    expect(s.completedSteps).toBe(1);
  });

  it("no foco, pausar congela o tempo (W37) e conta só o tempo focado", () => {
    let s = createRampState({ ...ramp, suggested: "focus" });
    s = rampReducer(s, { type: "tick", seconds: 60 }, ramp);
    s = rampReducer(s, { type: "togglePause" }, ramp);
    s = rampReducer(s, { type: "tick", seconds: 600 }, ramp);
    expect(s.remainingSeconds).toBe(1440);
    expect(s.focusSeconds).toBe(60);
    expect(s.paused).toBe(true);
  });

  it("Terminar foco vai para o registro (W38)", () => {
    const s = rampReducer(createRampState({ ...ramp, suggested: "focus" }), { type: "complete" }, ramp);
    expect(s.phase).toBe("register");
    expect(s.stepIndex).toBe(4);
  });

  it("parcial abre o controle com 50% e aceita de 5 a 95, de 5 em 5 (W39)", () => {
    let s = rampReducer(createRampState(ramp), { type: "togglePartial" }, ramp);
    expect(s.partialOpen).toBe(true);
    expect(s.partialPct).toBe(50);
    s = rampReducer(s, { type: "setPartialPct", pct: 72 }, ramp);
    expect(s.partialPct).toBe(70);
    s = rampReducer(s, { type: "setPartialPct", pct: 100 }, ramp);
    expect(s.partialPct).toBe(95);
    s = rampReducer(s, { type: "setPartialPct", pct: 0 }, ramp);
    expect(s.partialPct).toBe(5);
  });

  it("registrar leva à celebração com o resultado", () => {
    const s = rampReducer(createRampState(ramp), { type: "registered", outcome: "partial", goalProgressPct: 70 }, ramp);
    expect(s.phase).toBe("celebrate");
    expect(s.outcome).toBe("partial");
    expect(s.goalProgressPct).toBe(70);
  });
});
