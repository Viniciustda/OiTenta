import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GoalTrailPage from "./goal-trail.page";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: push }) }));
afterEach(() => { cleanup(); push.mockReset(); });

describe("W22 trilha do objetivo", () => {
  it("mostra a trilha do protótipo", async () => {
    render(<GoalTrailPage goalId="goal-eng" />);
    expect(await screen.findByRole("heading", { name: "Trabalho de Eng. Software" })).toBeTruthy();
    expect(screen.getByText("62%")).toBeTruthy();
    expect(screen.getByText("4 de 7 etapas")).toBeTruthy();
    expect(screen.getByText("4/7 concluídas")).toBeTruthy();
    expect(screen.getByText("2 dias")).toBeTruthy();
    expect(screen.getByText("8h no total")).toBeTruthy();
    expect(screen.getByText("Concluída · 45 min")).toBeTruthy();
    expect(screen.getByText("Hoje 20:00 · 1h30")).toBeTruthy();
    expect(screen.getAllByText("Entrega · 20/11")).toHaveLength(2); // cabeçalho e fim da trilha
  });

  it("Começar próxima etapa abre a rampa no Hoje", async () => {
    render(<GoalTrailPage goalId="goal-eng" />);
    fireEvent.click(await screen.findByRole("button", { name: "Começar próxima etapa" }));
    expect(push).toHaveBeenCalledWith("/hoje?goal=goal-eng&step=step-e5&block=block-e5-0");
  });

  it("objetivo inexistente mostra aviso", async () => {
    render(<GoalTrailPage goalId="nao-existe" />);
    expect(await screen.findByText("Objetivo não encontrado")).toBeTruthy();
  });
});
