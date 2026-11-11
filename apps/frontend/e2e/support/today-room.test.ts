import { describe, expect, it } from "vitest";
import { todayRoom } from "./today-room";

// Mesma regra do planejador: início = agora arredondado para cima em 15 min; bloco mínimo de 30 min;
// a janela de hoje vai até 23:00 (última célula da grade, 22h–23h).
describe("todayRoom (caminho do e2e: com ou sem bloco hoje)", () => {
  it("21:47 → começa 22:00, sobram 60 min: tem bloco hoje e pinta a partir das 22h", () => {
    expect(todayRoom(21, 47)).toEqual({ hours: [22], hasBlockToday: true });
  });

  it("22:30 → começa 22:30, sobram exatos 30 min: tem bloco hoje", () => {
    expect(todayRoom(22, 30)).toEqual({ hours: [22], hasBlockToday: true });
  });

  it("22:31 → começa 22:45, sobram 15 min: sem bloco hoje (caminho alternativo)", () => {
    expect(todayRoom(22, 31)).toEqual({ hours: [], hasBlockToday: false });
  });

  it("22:59 → começa 23:00, não sobra nada: sem bloco hoje", () => {
    expect(todayRoom(22, 59)).toEqual({ hours: [], hasBlockToday: false });
  });

  it("23:10 → depois da grade: sem bloco hoje", () => {
    expect(todayRoom(23, 10)).toEqual({ hours: [], hasBlockToday: false });
  });

  it("antes das 08h → pinta a grade inteira de hoje", () => {
    expect(todayRoom(6, 5).hours).toEqual(Array.from({ length: 15 }, (_, i) => 8 + i));
  });
});
