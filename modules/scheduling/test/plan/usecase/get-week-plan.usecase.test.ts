import { NotFoundError, ValidationException } from "@oitenta/shared";
import { GetWeekPlan, ScheduledBlock } from "../../../src";
import {
  FakeScheduledBlockRepository,
  FakeWeeklyAvailabilityRepository,
  makeAvailability,
  makeBlock,
  SAO_PAULO,
  USER_A,
  USER_B,
} from "../../mock";

function makeSut(blocks: ScheduledBlock[]) {
  return new GetWeekPlan(
    new FakeScheduledBlockRepository(blocks),
    new FakeWeeklyAvailabilityRepository([makeAvailability(USER_A, 180)]),
  );
}

describe("GetWeekPlan", () => {
  test("cenario 3: 7 dias de segunda a domingo com os minutos usados e o limite", async () => {
    const monday = makeBlock({
      start: new Date("2025-11-03T22:00:00.000Z"),
      end: new Date("2025-11-04T00:00:00.000Z"),
    });
    const mondayLate = makeBlock({
      start: new Date("2025-11-04T00:00:00.000Z"),
      end: new Date("2025-11-04T01:00:00.000Z"),
    });
    const sunday = makeBlock({
      start: new Date("2025-11-09T22:00:00.000Z"),
      end: new Date("2025-11-09T22:30:00.000Z"),
    });
    const nextMonday = makeBlock({
      start: new Date("2025-11-10T22:00:00.000Z"),
      end: new Date("2025-11-10T23:00:00.000Z"),
    });

    const output = await makeSut([sunday, nextMonday, mondayLate, monday]).execute({
      userId: USER_A,
      weekStart: "2025-11-03",
      timezone: SAO_PAULO,
    });

    expect(output.days.map((day) => day.date)).toEqual([
      "2025-11-03",
      "2025-11-04",
      "2025-11-05",
      "2025-11-06",
      "2025-11-07",
      "2025-11-08",
      "2025-11-09",
    ]);
    expect(output.days.map((day) => day.usedMinutes)).toEqual([180, 0, 0, 0, 0, 0, 30]);
    expect(output.days.every((day) => day.limitMinutes === 180)).toBe(true);
    expect(output.days[0]?.blocks).toEqual([monday, mondayLate]);
    expect(output.days[6]?.blocks).toEqual([sunday]);
  });

  test("cenario 4 (posse): blocos de B nao aparecem na semana de A", async () => {
    const ofB = makeBlock({
      userId: USER_B,
      start: new Date("2025-11-05T22:00:00.000Z"),
      end: new Date("2025-11-05T23:00:00.000Z"),
    });

    const output = await makeSut([ofB]).execute({ userId: USER_A, weekStart: "2025-11-03", timezone: SAO_PAULO });

    expect(output.days.every((day) => day.blocks.length === 0 && day.usedMinutes === 0)).toBe(true);
  });

  test("usuario sem disponibilidade -> NotFoundError", async () => {
    const useCase = new GetWeekPlan(new FakeScheduledBlockRepository(), new FakeWeeklyAvailabilityRepository());

    await expect(
      useCase.execute({ userId: USER_A, weekStart: "2025-11-03", timezone: SAO_PAULO }),
    ).rejects.toThrow(NotFoundError);
  });

  test("weekStart que nao e segunda -> ValidationException", async () => {
    await expect(
      makeSut([]).execute({ userId: USER_A, weekStart: "2025-11-04", timezone: SAO_PAULO }),
    ).rejects.toThrow(ValidationException);
  });
});
