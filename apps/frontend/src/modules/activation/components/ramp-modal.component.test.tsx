import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exampleBackend } from "@/modules/core/data/example-backend";
import { activationRepository } from "../data";
import RampModal from "./ramp-modal.component";

// Cada teste parte do backend de exemplo recém-criado: nenhum depende de outro.
beforeEach(() => exampleBackend.reset());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const target = { goalId: "goal-eng", stepId: "step-e5", blockId: "block-e5-0" };

async function open(energy: "low" | "medium" | "high" | "electric" | null = null, extra = {}) {
  const onClose = vi.fn();
  render(<RampModal target={target} energy={energy} onClose={onClose} onToast={() => {}} {...extra} />);
  await screen.findByText("Diagrama de casos de uso");
  return { onClose };
}

describe("W32–W41 modal da rampa", () => {
  it("sem check-in começa no Aquecer (W32)", async () => {
    await open();
    expect(screen.getByText("Degrau 1 de 5 · Aquecer")).toBeTruthy();
    expect(screen.getByText("Levanta, bebe uma água e abre o material de Eng. Software.")).toBeTruthy();
    expect(screen.getByText("03:00")).toBeTruthy();
  });

  it("Trocar mostra a alternativa (W33)", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Trocar" }));
    expect(screen.getByText("Arruma a mesa e deixa só o que vai usar.")).toBeTruthy();
  });

  it("energia alta começa no micro-passo (P14)", async () => {
    await open("high");
    expect(screen.getByText("Degrau 3 de 5 · Micro-passo")).toBeTruthy();
  });

  it("Concluí o degrau avança e avisa +5 gotas (W34, W35)", async () => {
    const onToast = vi.fn();
    await open(null, { onToast });
    fireEvent.click(screen.getByRole("button", { name: "Concluí o degrau" }));
    expect(screen.getByText("Degrau 2 de 5 · Desafio")).toBeTruthy();
    expect(screen.getByText("Em uma frase: quem usa o sistema e pra quê?")).toBeTruthy();
    expect(onToast).toHaveBeenCalledWith({ title: "+5 gotas", sub: "Degrau concluído", icon: "drop" });
  });

  it("foco: pausar e continuar (W36, W37)", async () => {
    await open("electric");
    expect(screen.getByText("Foco em: Diagrama de casos de uso")).toBeTruthy();
    expect(screen.getByText("25:00")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));
    expect(screen.getByText("Pausado. Quando voltar, eu te dou um mini-degrau de 2 min.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.queryByText(/Pausado\./)).toBeNull();
  });

  it("Terminar foco → registrar → Concluí → celebração com os valores fixos (W38, W41)", async () => {
    const record = vi.spyOn(activationRepository, "recordSession");
    await open("electric");
    fireEvent.click(screen.getByRole("button", { name: "Terminar foco" }));
    expect(screen.getByText("Quanto você avançou em “Diagrama de casos de uso”?")).toBeTruthy();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Concluí" })));
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ ...target, energy: "electric", outcome: "done", partialPct: null, availableTime: null }));
    expect(screen.getByText("+20 gotas")).toBeTruthy();
    expect(screen.getByText("“Diagrama de casos de uso” concluída")).toBeTruthy();
    expect(screen.getByText("+20 gotas da rampa · +1 XP de foco · Trabalho de Eng. Software agora em 81%")).toBeTruthy();
  });

  it("Parcial registra o % escolhido (W39)", async () => {
    const record = vi.spyOn(activationRepository, "recordSession");
    await open("electric");
    fireEvent.click(screen.getByRole("button", { name: "Terminar foco" }));
    fireEvent.click(screen.getByRole("button", { name: "Parcial" }));
    fireEvent.keyDown(screen.getByRole("slider", { name: "Quanto foi?" }), { key: "ArrowRight" });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Registrar 55% · +10 gotas" })));
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ outcome: "partial", partialPct: 55 }));
    expect(screen.getByText("+10 gotas")).toBeTruthy();
    expect(screen.getByText("55% de “Diagrama de casos de uso” registrado")).toBeTruthy();
  });

  it("Não rolou registra, avisa sem culpa e fecha (W40)", async () => {
    const record = vi.spyOn(activationRepository, "recordSession");
    const onToast = vi.fn();
    const { onClose } = await open("electric", { onToast });
    fireEvent.click(screen.getByRole("button", { name: "Terminar foco" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Não rolou" })));
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ outcome: "not_done" }));
    expect(onToast).toHaveBeenCalledWith({ title: "Tudo bem", sub: "Fica pra próxima, sem drama", icon: "plant" });
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("se o desafio traz contas (problems), a tela mostra as contas", async () => {
    const real = await activationRepository.getRamp({ goalId: target.goalId, stepId: target.stepId, energy: "medium" });
    real.steps[1].options[0] = {
      ...real.steps[1].options[0],
      title: "Soma",
      operation: "+",
      problems: [{ a: 7, b: 5, op: "+" }, { a: 9, b: 3, op: "−" }],
    };
    vi.spyOn(activationRepository, "getRamp").mockResolvedValue(real);
    await open("medium");
    expect(screen.getByText("7 + 5 = ?")).toBeTruthy();
    expect(screen.getByText("9 − 3 = ?")).toBeTruthy();
  });
});
