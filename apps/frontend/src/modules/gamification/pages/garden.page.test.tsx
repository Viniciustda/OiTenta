import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import GardenPage from "./garden.page";

afterEach(() => cleanup());

// Gamificação fora do MVP: a tela mostra os valores fixos do protótipo (P18), sem endpoint.
describe("W25 Jardim", () => {
  it("nível, XP e estágios do Broto com os valores do protótipo", () => {
    render(<GardenPage />);
    expect(screen.getByRole("heading", { name: "Jardim" })).toBeTruthy();
    expect(screen.getByText("Você rega, ele cresce")).toBeTruthy();
    expect(screen.getByText("Nível 7")).toBeTruthy();
    expect(screen.getByText("Broto · 70 min de foco até o Nível 8")).toBeTruthy();
    expect(screen.getByText("410 / 480")).toBeTruthy();
    for (const stage of ["Semente", "Broto", "Muda", "Arbusto", "Árvore jovem"]) expect(screen.getByText(stage)).toBeTruthy();
  });

  it("dias regados, semana, últimas 12 semanas e loja", () => {
    render(<GardenPage />);
    expect(screen.getByText("dias regados")).toBeTruthy();
    expect(screen.getByText("Falta regar hoje")).toBeTruthy();
    expect(screen.getAllByTestId("garden-week-day")).toHaveLength(7);
    expect(screen.getAllByTestId("garden-heat-cell")).toHaveLength(84);
    expect(screen.getByText("Guarda-chuva")).toBeTruthy();
    expect(screen.getByText("Protege 1 dia sem rega · você tem 1")).toBeTruthy();
    expect(screen.getByRole("button", { name: /50 · Comprar/ })).toBeTruthy();
  });

  it("as 5 conquistas do protótipo", () => {
    render(<GardenPage />);
    const list = screen.getByRole("list", { name: "Conquistas" });
    const names = within(list).getAllByRole("listitem").map((li) => li.querySelector("b")?.textContent);
    expect(names).toEqual(["Primeiro passo", "Rampa completa", "Voltou da pausa", "7 dias regados", "Entregue com folga"]);
    expect(within(list).getByText("Rara · 8% dos usuários")).toBeTruthy();
    expect(within(list).getByText("6 de 7")).toBeTruthy();
  });
});
