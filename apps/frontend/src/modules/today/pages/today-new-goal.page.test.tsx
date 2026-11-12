import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useSyncExternalStore } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exampleBackend } from "@/modules/core/data/example-backend";
import TodayPage from "./today.page";

// URL de mentira que muda de verdade: o Next (cacheComponents) mantém o Hoje montado entre navegações
// (Activity), então a mesma instância da tela vê a URL ir e voltar.
const url = vi.hoisted(() => {
  let search = new URLSearchParams();
  const listeners = new Set<() => void>();
  return {
    get: () => search,
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    go: (to: string) => {
      search = new URLSearchParams(to.split("?")[1] ?? "");
      listeners.forEach((l) => l());
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: url.go, replace: url.go }),
  useSearchParams: () => useSyncExternalStore(url.subscribe, url.get),
  usePathname: () => "/hoje",
}));

beforeEach(() => {
  exampleBackend.reset();
  url.go("/hoje");
});
afterEach(() => cleanup());

const novoObjetivo = () => act(async () => url.go("/hoje?novo=1"));

describe("Hoje: \"Novo objetivo\" abre o modal sempre (regressão)", () => {
  it("abre de novo depois de fechar o modal", async () => {
    render(<TodayPage />);
    await novoObjetivo();
    expect(await screen.findByRole("dialog", { name: "Novo objetivo" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Prefiro preencher à mão" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Voltar" })));
    expect(screen.queryByRole("dialog", { name: "Novo objetivo" })).toBeNull();

    await novoObjetivo();
    expect(await screen.findByRole("dialog", { name: "Novo objetivo" })).toBeTruthy();
  });

  it("depois de cadastrar um objetivo, abre vazio para cadastrar outro", async () => {
    render(<TodayPage />);
    for (const title of ["Trabalho de Algoritmos", "Prova de Física"]) {
      await novoObjetivo();
      const dialog = await screen.findByRole("dialog", { name: "Novo objetivo" });
      fireEvent.click(screen.getByRole("button", { name: "Prefiro preencher à mão" }));
      expect((screen.getByLabelText("Objetivo") as HTMLInputElement).value).toBe("");
      fireEvent.change(screen.getByLabelText("Objetivo"), { target: { value: title } });
      fireEvent.click(screen.getByRole("button", { name: "Adicionar etapa" }));
      fireEvent.change(screen.getByLabelText("Etapa 1"), { target: { value: "Começar" } });
      await act(async () => fireEvent.click(screen.getByRole("button", { name: "Encaixar no meu calendário" })));
      expect(dialog.isConnected).toBe(false);
    }
    expect(exampleBackend.goals.map((g) => g.title)).toEqual(expect.arrayContaining(["Trabalho de Algoritmos", "Prova de Física"]));
  });

  it("depois de cadastrar, voltar e fechar, o botão ainda abre o modal", async () => {
    render(<TodayPage />);
    await novoObjetivo();
    fireEvent.click(await screen.findByRole("button", { name: "Prefiro preencher à mão" }));
    fireEvent.change(await screen.findByLabelText("Objetivo"), { target: { value: "Trabalho de Algoritmos" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar etapa" }));
    fireEvent.change(screen.getByLabelText("Etapa 1"), { target: { value: "Começar" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Encaixar no meu calendário" })));
    // "Voltar" do navegador: a URL volta a ser /hoje?novo=1 e o modal reaparece; o usuário fecha.
    await novoObjetivo();
    fireEvent.click(await screen.findByRole("button", { name: "Prefiro preencher à mão" }));
    await act(async () => fireEvent.click(await screen.findByRole("button", { name: "Voltar" })));
    expect(screen.queryByRole("dialog", { name: "Novo objetivo" })).toBeNull();

    await novoObjetivo();
    expect(await screen.findByRole("dialog", { name: "Novo objetivo" })).toBeTruthy();
  });
});
