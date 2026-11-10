import {
  addDays,
  ceilToGranularity,
  floorToGranularity,
  localToUtc,
  minutesBetween,
  subtractIntervals,
  toLocalParts,
  weekdayOf,
} from "../../src";
import { SAO_PAULO } from "../mock";

describe("zoned-time", () => {
  test("converte 08:00 locais de Sao Paulo para 11:00 UTC", () => {
    expect(localToUtc("2025-11-03", 480, SAO_PAULO).toISOString()).toBe(
      "2025-11-03T11:00:00.000Z",
    );
  });

  test("minuto 1440 vira a meia-noite do dia seguinte", () => {
    expect(localToUtc("2025-11-03", 1440, SAO_PAULO).toISOString()).toBe(
      "2025-11-04T03:00:00.000Z",
    );
  });

  test("respeita o horario de verao (New York, depois da troca)", () => {
    expect(localToUtc("2025-11-02", 600, "America/New_York").toISOString()).toBe(
      "2025-11-02T15:00:00.000Z",
    );
    expect(localToUtc("2025-11-01", 600, "America/New_York").toISOString()).toBe(
      "2025-11-01T14:00:00.000Z",
    );
  });

  test("devolve data local, minuto e dia da semana de um instante", () => {
    expect(toLocalParts(new Date("2025-11-04T02:30:00.000Z"), SAO_PAULO)).toEqual({
      date: "2025-11-03",
      minute: 23 * 60 + 30,
      weekday: 0,
    });
  });

  test("weekdayOf usa 0 = segunda e 6 = domingo", () => {
    expect(weekdayOf("2025-11-03")).toBe(0);
    expect(weekdayOf("2025-11-08")).toBe(5);
    expect(weekdayOf("2025-11-09")).toBe(6);
  });

  test("addDays atravessa meses", () => {
    expect(addDays("2025-11-30", 1)).toBe("2025-12-01");
    expect(addDays("2025-12-01", -1)).toBe("2025-11-30");
  });

  test("minutesBetween e o arredondamento para a grade de 15 min", () => {
    const a = new Date("2025-11-03T23:10:00.000Z");
    expect(minutesBetween(new Date("2025-11-03T23:00:00.000Z"), a)).toBe(10);
    expect(ceilToGranularity(a, 15).toISOString()).toBe("2025-11-03T23:15:00.000Z");
    expect(floorToGranularity(a, 15).toISOString()).toBe("2025-11-03T23:00:00.000Z");
  });
});

describe("subtractIntervals", () => {
  const at = (h: number, m = 0) => new Date(Date.UTC(2025, 10, 3, h, m));

  test("remove o ocupado do meio, das pontas e ignora o que nao toca", () => {
    const result = subtractIntervals(
      [{ start: at(10), end: at(14) }],
      [
        { start: at(8), end: at(9) },
        { start: at(9), end: at(10, 30) },
        { start: at(11), end: at(12) },
        { start: at(13, 30), end: at(15) },
      ],
    );

    expect(result).toEqual([
      { start: at(10, 30), end: at(11) },
      { start: at(12), end: at(13, 30) },
    ]);
  });

  test("ocupado que cobre tudo elimina o intervalo", () => {
    expect(
      subtractIntervals([{ start: at(10), end: at(11) }], [{ start: at(9), end: at(12) }]),
    ).toEqual([]);
  });
});
