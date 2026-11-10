import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { goalsRepository } from "../data";
import NewGoalModal from "./new-goal-modal.component";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("novo objetivo — W30 começando vazia (P20)", () => {
  it("começa vazia, sem os elementos da IA", () => {
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    expect((screen.getByLabelText("Objetivo") as HTMLInputElement).value).toBe("");
    expect(screen.getByText("0 etapas · edite o que quiser")).toBeTruthy();
    expect(screen.getByText("0 min")).toBeTruthy();
    expect(screen.queryByText("A IA achou")).toBeNull();
  });

  it("Adicionar etapa, mudar o tempo e somar o total", () => {
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar etapa" }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar etapa" }));
    expect(screen.getByText("2 etapas · edite o que quiser")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Mais 15 min" })[0]);
    expect(screen.getByText("1h15")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Remover etapa" })[1]);
    expect(screen.getByText("1 etapa · edite o que quiser")).toBeTruthy();
  });

  it("valida antes de encaixar", async () => {
    const create = vi.spyOn(goalsRepository, "create");
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Encaixar no meu calendário" })));
    expect(screen.getByRole("alert").textContent).toBe("Dá um nome pro objetivo.");
    expect(create).not.toHaveBeenCalled();
  });

  it("Encaixar no meu calendário cria o objetivo", async () => {
    const create = vi.spyOn(goalsRepository, "create");
    const onCreated = vi.fn();
    render(<NewGoalModal onClose={() => {}} onCreated={onCreated} />);
    fireEvent.change(screen.getByLabelText("Objetivo"), { target: { value: "Trabalho de Algoritmos" } });
    fireEvent.change(screen.getByLabelText("Entrega"), { target: { value: "2026-11-24" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar etapa" }));
    fireEvent.change(screen.getByLabelText("Etapa 1"), { target: { value: "Ler o enunciado" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Encaixar no meu calendário" })));
    expect(create).toHaveBeenCalledWith({
      title: "Trabalho de Algoritmos",
      deadline: "2026-11-24",
      kind: "goal",
      steps: [{ title: "Ler o enunciado", estimatedMinutes: 30, microSteps: [] }],
    });
    expect(onCreated).toHaveBeenCalled();
  });
});
