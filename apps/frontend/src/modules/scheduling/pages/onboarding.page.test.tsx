import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { schedulingRepository } from "../data";
import OnboardingPage from "./onboarding.page";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: push }) }));
afterEach(() => { cleanup(); push.mockReset(); vi.restoreAllMocks(); });

describe("W05–W11 onboarding", () => {
  it("passo 1: boas-vindas e \"Me conta mais\"", () => {
    render(<OnboardingPage />);
    expect(screen.getByText("Passo 1 de 4")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Me conta mais" }));
    expect(screen.getByText(/Eu quebro seus trabalhos em degraus pequenos/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Me conta mais" })).toBeNull();
  });

  it("fluxo completo grava a grade e o limite e vai para o Hoje", async () => {
    const save = vi.spyOn(schedulingRepository, "setAvailability");
    render(<OnboardingPage />);
    fireEvent.click(screen.getByRole("button", { name: "Bora!" }));
    expect(screen.getByText("Passo 2 de 4")).toBeTruthy();
    const pronto = screen.getByRole("button", { name: "Pronto, esses são meus horários" }) as HTMLButtonElement;
    expect(pronto.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Usar sugestão do Broto" }));
    expect(screen.getByText("Livre · 25h por semana")).toBeTruthy();
    fireEvent.click(pronto);
    expect(screen.getByText("25h livres por semana")).toBeTruthy();
    expect(screen.getByText("Passo 3 de 4")).toBeTruthy();
    const slider = screen.getByRole("slider", { name: "Máximo por dia" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    fireEvent.click(screen.getByRole("button", { name: "Esse é meu limite" }));
    expect(screen.getByText("3h por dia")).toBeTruthy();
    expect(screen.getByText("Passo 4 de 4")).toBeTruthy();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Ir pro meu dia" })));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ dailyLimitMinutes: 180 }));
    expect(save.mock.calls[0][0].windows).toHaveLength(8);
    expect(push).toHaveBeenCalledWith("/hoje");
  });

  it("pintar uma célula da grade conta 1h", () => {
    render(<OnboardingPage />);
    fireEvent.click(screen.getByRole("button", { name: "Bora!" }));
    fireEvent.mouseDown(screen.getByTitle("Seg 20h–21h"));
    expect(screen.getByText("Livre · 1h por semana")).toBeTruthy();
  });
});
