import { describe, expect, it } from "vitest";
import {
  addDays,
  dayLabel,
  formatDdMm,
  formatDuration,
  formatHm,
  formatLongDateTime,
  localDate,
  localMinute,
  weekdayShort,
} from "./time.format";

const TZ = "America/Sao_Paulo";

describe("formatDuration (protótipo: dur)", () => {
  it("minutos abaixo de 1h", () => expect(formatDuration(45)).toBe("45 min"));
  it("hora cheia", () => expect(formatDuration(180)).toBe("3h"));
  it("hora e minutos", () => expect(formatDuration(90)).toBe("1h30"));
  it("hora e minutos com zero à esquerda", () => expect(formatDuration(495)).toBe("8h15"));
  it("zero", () => expect(formatDuration(0)).toBe("0 min"));
});

describe("datas e horas locais", () => {
  const iso = "2026-11-16T23:00:00.000Z"; // 20:00 em São Paulo
  it("hora local", () => expect(formatHm(iso, TZ)).toBe("20:00"));
  it("minuto local", () => expect(localMinute(iso, TZ)).toBe(1200));
  it("data local", () => expect(localDate(iso, TZ)).toBe("2026-11-16"));
  it("data local de um instante que já é o dia seguinte em UTC", () =>
    expect(localDate("2026-11-17T01:30:00.000Z", TZ)).toBe("2026-11-16"));
  it("dd/mm", () => expect(formatDdMm("2026-11-20")).toBe("20/11"));
  it("soma dias numa data local", () => expect(addDays("2026-11-30", 2)).toBe("2026-12-02"));
  it("dia da semana curto (0 = segunda)", () => expect(weekdayShort("2026-11-18")).toBe("Qua"));
  it("cabeçalho do Hoje", () =>
    expect(formatLongDateTime("2026-11-16T22:40:00.000Z", TZ)).toBe("Segunda, 16 de novembro · 19:40"));
});

describe("dayLabel (protótipo: Hoje, Amanhã, Qua, 18/11)", () => {
  it("hoje", () => expect(dayLabel("2026-11-16", "2026-11-16")).toBe("Hoje"));
  it("amanhã", () => expect(dayLabel("2026-11-17", "2026-11-16")).toBe("Amanhã"));
  it("outro dia", () => expect(dayLabel("2026-11-18", "2026-11-16")).toBe("Qua, 18/11"));
});
