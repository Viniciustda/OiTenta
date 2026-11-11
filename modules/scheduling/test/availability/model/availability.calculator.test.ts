import { AvailabilityCalculator, AvailabilityWindow, minutesBetween } from "../../../src";
import { SAO_PAULO } from "../../mock";

const calculator = new AvailabilityCalculator();
const MONDAY_EVENING: AvailabilityWindow = { weekday: 0, startMinute: 19 * 60, endMinute: 23 * 60 };
// Segunda 03/11/2025 em Sao Paulo (UTC-3): 00:00 local = 03:00 UTC.
const MONDAY_START = new Date("2025-11-03T03:00:00.000Z");
const TUESDAY_START = new Date("2025-11-04T03:00:00.000Z");
const EARLY = new Date("2025-11-01T00:00:00.000Z");

function minutes(intervals: { start: Date; end: Date }[]): number[] {
  return intervals.map((item) => minutesBetween(item.start, item.end));
}

describe("AvailabilityCalculator", () => {
  test("cenario 1: janela seg 19-23 sem ocupados da 1 intervalo de 240 min", () => {
    const free = calculator.freeIntervals({
      windows: [MONDAY_EVENING],
      timezone: SAO_PAULO,
      from: MONDAY_START,
      to: TUESDAY_START,
      busy: [],
      now: EARLY,
    });

    expect(minutes(free)).toEqual([240]);
  });

  test("cenario 2: ocupado de 20-21 divide em 60 + 120 min", () => {
    const free = calculator.freeIntervals({
      windows: [MONDAY_EVENING],
      timezone: SAO_PAULO,
      from: MONDAY_START,
      to: TUESDAY_START,
      busy: [
        {
          start: new Date("2025-11-03T23:00:00.000Z"),
          end: new Date("2025-11-04T00:00:00.000Z"),
        },
      ],
      now: EARLY,
    });

    expect(minutes(free)).toEqual([60, 120]);
  });

  test("cenario 3: now = segunda 20:10 comeca em 20:15 e descarta o passado", () => {
    const free = calculator.freeIntervals({
      windows: [MONDAY_EVENING],
      timezone: SAO_PAULO,
      from: MONDAY_START,
      to: TUESDAY_START,
      busy: [],
      now: new Date("2025-11-03T23:10:00.000Z"),
    });

    expect(free.map((item) => item.start.toISOString())).toEqual(["2025-11-03T23:15:00.000Z"]);
    expect(minutes(free)).toEqual([165]);
  });

  test("cenario 4: janelas so nos dias de semana dao zero intervalos no sabado", () => {
    const weekdays = [0, 1, 2, 3, 4].map((weekday) => ({ ...MONDAY_EVENING, weekday }));

    const free = calculator.freeIntervals({
      windows: weekdays,
      timezone: SAO_PAULO,
      from: new Date("2025-11-08T03:00:00.000Z"),
      to: new Date("2025-11-09T03:00:00.000Z"),
      busy: [],
      now: EARLY,
    });

    expect(free).toEqual([]);
  });

  test("cenario 5: 19:00-23:00 em Sao Paulo vira 22:00-02:00 UTC", () => {
    const free = calculator.freeIntervals({
      windows: [MONDAY_EVENING],
      timezone: SAO_PAULO,
      from: MONDAY_START,
      to: TUESDAY_START,
      busy: [],
      now: EARLY,
    });

    expect(free).toEqual([
      {
        start: new Date("2025-11-03T22:00:00.000Z"),
        end: new Date("2025-11-04T02:00:00.000Z"),
      },
    ]);
  });

  test("corta no fim do periodo, ordena varios dias e descarta sobras menores que 15 min", () => {
    const everyDay = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ ...MONDAY_EVENING, weekday }));

    const free = calculator.freeIntervals({
      windows: everyDay,
      timezone: SAO_PAULO,
      from: MONDAY_START,
      to: new Date("2025-11-05T23:00:00.000Z"),
      busy: [
        {
          start: new Date("2025-11-04T22:00:00.000Z"),
          end: new Date("2025-11-05T01:50:00.000Z"),
        },
      ],
      now: EARLY,
    });

    expect(free.map((item) => item.start.toISOString())).toEqual([
      "2025-11-03T22:00:00.000Z",
      "2025-11-05T22:00:00.000Z",
    ]);
    expect(minutes(free)).toEqual([240, 60]);
  });
});
