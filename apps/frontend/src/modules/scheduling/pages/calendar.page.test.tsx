import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CalendarPage from "./calendar.page";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: push }) }));
afterEach(() => { cleanup(); push.mockReset(); });

describe("W15–W16 calendário semana (Execução) e detalhe do bloco", () => {
  it("mostra a semana do protótipo com a carga de cada dia", async () => {
    render(<CalendarPage />);
    expect(await screen.findByText("16–22 de novembro")).toBeTruthy();
    expect(screen.getAllByText("3h de 3h")).toHaveLength(4);
    expect(screen.getByText("2h45 de 3h")).toBeTruthy();
    expect(screen.getByText("1h15 de 3h")).toBeTruthy();
    expect(screen.getByText("livre")).toBeTruthy();
  });

  it("clicar num bloco abre o detalhe só leitura", async () => {
    render(<CalendarPage />);
    fireEvent.click(await screen.findByTitle("Trabalho de Eng. Software · Diagrama de casos de uso · 20:00–21:30"));
    expect(screen.getByRole("heading", { name: "Diagrama de casos de uso" })).toBeTruthy();
    expect(screen.getByText("Hoje, 16/11 · 20:00–21:30")).toBeTruthy();
    expect(screen.getByText("Etapa inteira")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Começar agora" }));
    expect(push).toHaveBeenCalledWith("/hoje?goal=goal-eng&step=step-e5&block=block-e5-0");
  });

  it("filtro de objetivo esconde os blocos dele", async () => {
    render(<CalendarPage />);
    await screen.findByText("16–22 de novembro");
    fireEvent.click(screen.getByRole("button", { name: /Trabalho de Eng. Software/ }));
    expect(screen.queryByTitle(/Diagrama de casos de uso/)).toBeNull();
  });
});
