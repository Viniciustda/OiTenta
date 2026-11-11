import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppShell from "./app-shell.component";

const push = vi.fn();
const nav = vi.hoisted(() => ({ pathname: "/hoje" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: push }),
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(),
}));
afterEach(() => {
  cleanup();
  push.mockReset();
  nav.pathname = "/hoje";
});

const renderShell = async () => {
  await act(async () => {
    render(<AppShell><p>conteúdo</p></AppShell>);
  });
};

describe("sidebar do web app", () => {
  it.each([
    ["Objetivos", "/objetivos"],
    ["Jardim", "/jardim"],
    ["Configurações", "/configuracoes"],
  ])("%s navega para %s (W21, W25, W26)", async (label, href) => {
    await renderShell();
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(push).toHaveBeenCalledWith(href);
  });

  it("marca o item da rota atual", async () => {
    nav.pathname = "/configuracoes";
    await renderShell();
    expect(screen.getByRole("button", { name: "Configurações" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Objetivos" }).getAttribute("aria-current")).toBeNull();
  });
});
