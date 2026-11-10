import { describe, expect, it } from "vitest";
import { blockGeometry, dayLoadLabel, freeRects, weekRangeLabel, blockDetail } from "./calendar.logic";

const TZ = "America/Sao_Paulo";

describe("calendário semana — Execução (W15)", () => {
  it("rótulo da semana", () => {
    expect(weekRangeLabel("2026-11-16")).toBe("16–22 de novembro");
    expect(weekRangeLabel("2026-11-30")).toBe("30 nov – 6 dez");
  });

  it("carga do dia: \"3h de 3h\" ou \"livre\"", () => {
    expect(dayLoadLabel(180, 180)).toBe("3h de 3h");
    expect(dayLoadLabel(165, 180)).toBe("2h45 de 3h");
    expect(dayLoadLabel(0, 180)).toBe("livre");
  });

  it("posição do bloco: 40px por hora a partir das 08h", () => {
    expect(blockGeometry("2026-11-16T23:00:00.000Z", "2026-11-17T00:30:00.000Z", TZ)).toEqual({ top: 481, height: 57 });
    expect(blockGeometry("2026-11-21T13:00:00.000Z", "2026-11-21T13:15:00.000Z", TZ)).toEqual({ top: 81, height: 20 });
  });

  it("faixas livres a partir das janelas do dia", () => {
    expect(freeRects([{ weekday: 5, startMinute: 540, endMinute: 720 }, { weekday: 5, startMinute: 840, endMinute: 1080 }], 5)).toEqual([
      { top: 40, height: 120 },
      { top: 240, height: 160 },
    ]);
  });

  it("detalhe do bloco (W16)", () => {
    expect(
      blockDetail(
        { start: "2026-11-16T23:00:00.000Z", end: "2026-11-17T00:30:00.000Z" },
        "2026-11-16",
        TZ,
      ),
    ).toEqual({ when: "Hoje, 16/11 · 20:00–21:30", duration: "1h30" });
    expect(
      blockDetail({ start: "2026-11-18T23:00:00.000Z", end: "2026-11-18T23:30:00.000Z" }, "2026-11-16", TZ).when,
    ).toBe("Qua, 18/11 · 20:00–20:30");
  });
});
