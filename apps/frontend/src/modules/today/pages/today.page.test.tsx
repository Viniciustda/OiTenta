import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exampleBackend } from "@/modules/core/data/example-backend";
import TodayPage from "./today.page";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: push }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/hoje",
}));
beforeEach(() => exampleBackend.reset());
afterEach(() => { cleanup(); push.mockReset(); });

describe("W12–W14 Hoje", () => {
  it("mostra o dia do protótipo", async () => {
    render(<TodayPage />);
    expect(await screen.findByText("Diagrama de casos de uso")).toBeTruthy();
    expect(screen.getByText("Segunda, 16 de novembro · 19:40")).toBeTruthy();
    expect(screen.getByText("3 etapas hoje · 3h de foco planejado. O resto da noite é seu.")).toBeTruthy();
    expect(screen.getByText("Próxima: Diagrama de casos de uso · hoje às 20:00")).toBeTruthy();
    expect(screen.getByText("Próxima · 20:00")).toBeTruthy();
    expect(screen.getByText("Entrega 20/11 · folga de 2 dias")).toBeTruthy();
  });

  it("só mostra a data depois de carregar os dados (o HTML do servidor não tem a hora real: sem hydration mismatch)", async () => {
    render(<TodayPage />);
    expect(screen.queryByText("Segunda, 16 de novembro · 19:40")).toBeNull();
    expect(await screen.findByText("Segunda, 16 de novembro · 19:40")).toBeTruthy();
  });

  it("check-in com 4 níveis; Elétrico leva direto ao foco (P14)", async () => {
    render(<TodayPage />);
    await screen.findByText("Diagrama de casos de uso");
    expect(screen.getAllByRole("button", { name: /^(Baixa|Média|Alta|Elétrico)$/ })).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Elétrico" }));
    expect(screen.getByText("Bora! Direto pro foco.")).toBeTruthy();
    expect(screen.getByText("Direto pro foco · 25 min de foco")).toBeTruthy();
  });

  it("\"Vamos começar?\" abre a rampa da próxima etapa", async () => {
    render(<TodayPage />);
    await screen.findByText("Diagrama de casos de uso");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Vamos começar\?/ })));
    expect(await screen.findByRole("dialog", { name: "Rampa até o foco" })).toBeTruthy();
  });

  it("um objetivo da coluna leva à trilha", async () => {
    render(<TodayPage />);
    fireEvent.click(await screen.findByRole("button", { name: /Prova de Cálculo II\s*25%/ }));
    expect(push).toHaveBeenCalledWith("/objetivos/goal-calc");
  });

  it("W40: depois de registrar, mostra a conquista \"7 dias regados\" com os valores fixos (P18)", async () => {
    render(<TodayPage />);
    await screen.findByText("Diagrama de casos de uso");
    fireEvent.click(screen.getByRole("button", { name: "Elétrico" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Vamos começar\?/ })));
    fireEvent.click(await screen.findByRole("button", { name: "Terminar foco" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Não rolou" })));
    const marco = await screen.findByRole("dialog", { name: "Conquista" });
    expect(marco.textContent).toContain("Conquista rara");
    expect(marco.textContent).toContain("7 dias regados");
    expect(marco.textContent).toContain("Uma semana inteira cuidando do Broto. Ele tá orgulhoso de você.");
    fireEvent.click(screen.getByRole("button", { name: "Bora!" }));
    expect(screen.queryByRole("dialog", { name: "Conquista" })).toBeNull();
  });
});
