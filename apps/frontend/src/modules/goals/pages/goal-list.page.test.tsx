import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exampleBackend } from "@/modules/core/data/example-backend";
import GoalListPage from "./goal-list.page";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: push }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/objetivos",
}));
beforeEach(() => exampleBackend.reset());
afterEach(() => { cleanup(); push.mockReset(); });

describe("W21 Objetivos", () => {
  it("lista os objetivos com prazo, próxima etapa, % e folga", async () => {
    render(<GoalListPage />);
    expect(await screen.findByText("3 ativos")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Objetivos" })).toBeTruthy();
    const eng = await screen.findByRole("button", { name: /Trabalho de Eng\. Software/ });
    expect(eng.textContent).toContain("Entrega · 20/11");
    expect(eng.textContent).toContain("Próxima: Diagrama de casos de uso · hoje às 20:00");
    expect(eng.textContent).toContain("Folga de 2 dias");
    expect(eng.textContent).toContain("62%");
    const calc = screen.getByRole("button", { name: /Prova de Cálculo II/ });
    expect(calc.textContent).toContain("Entrega · 27/11");
    expect(calc.textContent).toContain("Folga de 6 dias");
    expect(calc.textContent).toContain("25%");
  });

  it("um objetivo abre a trilha (W22)", async () => {
    render(<GoalListPage />);
    fireEvent.click(await screen.findByRole("button", { name: /Prova de Cálculo II/ }));
    expect(push).toHaveBeenCalledWith("/objetivos/goal-calc");
  });

  it("\"Novo objetivo\" abre o modal sobre o Hoje (P24)", async () => {
    render(<GoalListPage />);
    await screen.findByText("3 ativos");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Novo objetivo" })));
    expect(push).toHaveBeenCalledWith("/hoje?novo=1");
  });
});
