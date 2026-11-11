import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authRepository } from "@/modules/auth/data";
import { clock } from "@/modules/core/data/clock";
import { exampleBackend } from "@/modules/core/data/example-backend";
import { schedulingRepository } from "@/modules/scheduling/data";
import { settingsRepository } from "../data";
import SettingsPage from "./settings.page";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: push }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/configuracoes",
}));
beforeEach(async () => {
  exampleBackend.reset();
  await settingsRepository.setTheme("light");
  await settingsRepository.setDailyEmail(true);
});
afterEach(() => {
  cleanup();
  push.mockReset();
  vi.restoreAllMocks();
});

const open = async () => {
  render(<SettingsPage />);
  await screen.findByText("Livre · 25h por semana");
};

describe("W26 Configurações", () => {
  it("mostra o usuário, o tema, a grade e o limite atuais", async () => {
    await open();
    expect(screen.getByRole("heading", { name: "Configurações", level: 1 })).toBeTruthy();
    expect(screen.getByText("Arthur · arthur@faculdade.edu.br")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Claro" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("slider", { name: "Limite diário" }).getAttribute("aria-valuenow")).toBe("180");
    expect(screen.getByText("3h")).toBeTruthy();
  });

  it("redefinir a rotina na grade grava a disponibilidade (PUT /scheduling/availability)", async () => {
    const save = vi.spyOn(schedulingRepository, "setAvailability");
    await open();
    fireEvent.mouseDown(screen.getByTitle("Seg 8h–9h"));
    fireEvent.mouseUp(window);
    expect(screen.getByText("Livre · 26h por semana")).toBeTruthy();
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    const input = save.mock.calls[0][0];
    expect(input.dailyLimitMinutes).toBe(180);
    expect(input.windows).toContainEqual({ weekday: 0, startMinute: 480, endMinute: 540 });
    expect((await schedulingRepository.getAvailability()).availability.windows).toContainEqual({ weekday: 0, startMinute: 480, endMinute: 540 });
  });

  it("mudar o limite diário grava junto com a grade", async () => {
    const save = vi.spyOn(schedulingRepository, "setAvailability");
    await open();
    fireEvent.keyDown(screen.getByRole("slider", { name: "Limite diário" }), { key: "ArrowRight" });
    expect(screen.getByText("3h30")).toBeTruthy();
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save.mock.calls[0][0].dailyLimitMinutes).toBe(210);
    expect(save.mock.calls[0][0].windows).toHaveLength(8); // a grade do demo: 5 noites, sábado em 2 janelas, domingo
  });

  it("grade vazia não é gravada (o contrato exige ao menos uma janela)", async () => {
    const save = vi.spyOn(schedulingRepository, "setAvailability");
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(screen.getByText("Livre · 0h por semana")).toBeTruthy();
    await new Promise((r) => setTimeout(r, 700));
    expect(save).not.toHaveBeenCalled();
  });

  it("tema e e-mail diário ficam nas preferências de exemplo (sem endpoint)", async () => {
    await open();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Escuro" })));
    expect(screen.getByRole("button", { name: "Escuro" }).getAttribute("aria-pressed")).toBe("true");
    const sw = screen.getByRole("switch", { name: "E-mail diário" });
    expect(sw.getAttribute("aria-checked")).toBe("true");
    await act(async () => fireEvent.click(sw));
    expect(sw.getAttribute("aria-checked")).toBe("false");
    expect(await settingsRepository.getPreferences()).toEqual({ theme: "dark", dailyEmail: false });
  });

  it("a prévia do e-mail mostra o plano de hoje", async () => {
    await open();
    const preview = await screen.findByLabelText("Prévia do e-mail diário");
    expect(within(preview).getAllByText("Seu plano de hoje, Arthur")).toHaveLength(2);
    expect(within(preview).getByText("Segunda, 16 de novembro")).toBeTruthy();
    expect(await within(preview).findByText("Diagrama de casos de uso")).toBeTruthy();
    expect(within(preview).getByText("20:00")).toBeTruthy();
  });

  it("Sair encerra a sessão e volta para o login", async () => {
    const logout = vi.spyOn(authRepository, "logout");
    await open();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Sair" })));
    expect(logout).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/entrar");
  });

  it("o relógio avançar durante uma edição pendente não desfaz a edição na tela", async () => {
    const getAvailability = vi.spyOn(schedulingRepository, "getAvailability");
    const now = vi.spyOn(clock, "now");
    await open();
    now.mockReturnValue("2026-11-16T22:41:00.000Z"); // virou o minuto
    fireEvent.mouseDown(screen.getByTitle("Seg 8h–9h"));
    fireEvent.mouseUp(window);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(screen.getByText("Livre · 26h por semana")).toBeTruthy();
    expect(getAvailability).toHaveBeenCalledTimes(1);
  });

  it("dados do servidor que chegam depois de uma edição não sobrescrevem a edição", async () => {
    let release: () => void = () => {};
    const real = schedulingRepository.getAvailability.bind(schedulingRepository);
    vi.spyOn(schedulingRepository, "getAvailability").mockImplementation(
      () => new Promise((resolve) => { release = () => resolve(real()); }),
    );
    render(<SettingsPage />);
    await screen.findByText("Livre · 0h por semana");
    fireEvent.mouseDown(screen.getByTitle("Seg 8h–9h"));
    fireEvent.mouseUp(window);
    await act(async () => {
      release();
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(screen.getByText("Livre · 1h por semana")).toBeTruthy();
  });
});
