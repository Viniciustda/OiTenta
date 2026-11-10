import { NotFoundError, ValidationException } from "@oitenta/shared";
import { GetDayPlan, ScheduledBlock } from "../../../src";
import {
  FakeScheduledBlockRepository,
  FakeWeeklyAvailabilityRepository,
  makeAvailability,
  makeBlock,
  SAO_PAULO,
  USER_A,
  USER_B,
} from "../../mock";

// 06/11/2025 em Sao Paulo: 00:00 local = 03:00 UTC.
const ON_6TH_LATE = makeBlock({
  start: new Date("2025-11-06T23:00:00.000Z"),
  end: new Date("2025-11-07T00:00:00.000Z"),
});
const ON_6TH_EARLY = makeBlock({
  start: new Date("2025-11-06T22:00:00.000Z"),
  end: new Date("2025-11-06T23:00:00.000Z"),
});
const ON_7TH = makeBlock({
  start: new Date("2025-11-07T22:00:00.000Z"),
  end: new Date("2025-11-07T23:00:00.000Z"),
});

function makeSut(blocks: ScheduledBlock[]) {
  return new GetDayPlan(
    new FakeScheduledBlockRepository(blocks),
    new FakeWeeklyAvailabilityRepository([makeAvailability(USER_A, 180)]),
  );
}

describe("GetDayPlan", () => {
  test("cenario 1: so os blocos de 06/11, em ordem de inicio, com minutos usados e limite", async () => {
    const output = await makeSut([ON_7TH, ON_6TH_LATE, ON_6TH_EARLY]).execute({
      userId: USER_A,
      date: "2025-11-06",
      timezone: SAO_PAULO,
    });

    expect(output).toEqual({
      date: "2025-11-06",
      blocks: [ON_6TH_EARLY, ON_6TH_LATE],
      usedMinutes: 120,
      limitMinutes: 180,
    });
  });

  test("cenario 2: bloco 23:30-00:30 locais aparece no dia em que comeca (P13)", async () => {
    const crossing = makeBlock({
      start: new Date("2025-11-07T02:30:00.000Z"),
      end: new Date("2025-11-07T03:30:00.000Z"),
    });
    const useCase = makeSut([crossing]);

    const sixth = await useCase.execute({ userId: USER_A, date: "2025-11-06", timezone: SAO_PAULO });
    const seventh = await useCase.execute({ userId: USER_A, date: "2025-11-07", timezone: SAO_PAULO });

    expect(sixth.blocks).toEqual([crossing]);
    expect(sixth.usedMinutes).toBe(60);
    expect(seventh.blocks).toEqual([]);
    expect(seventh.usedMinutes).toBe(0);
  });

  test("cenario 4 (posse): blocos de A e B no mesmo dia, A recebe so os dele", async () => {
    const ofB = makeBlock({ userId: USER_B, start: ON_6TH_EARLY.start, end: ON_6TH_EARLY.end });

    const output = await makeSut([ON_6TH_EARLY, ofB]).execute({
      userId: USER_A,
      date: "2025-11-06",
      timezone: SAO_PAULO,
    });

    expect(output.blocks).toEqual([ON_6TH_EARLY]);
    expect(output.usedMinutes).toBe(60);
  });

  test("usuario sem disponibilidade -> NotFoundError", async () => {
    const useCase = new GetDayPlan(
      new FakeScheduledBlockRepository([ON_6TH_EARLY]),
      new FakeWeeklyAvailabilityRepository(),
    );

    await expect(
      useCase.execute({ userId: USER_A, date: "2025-11-06", timezone: SAO_PAULO }),
    ).rejects.toThrow(NotFoundError);
  });

  test("posse: so a disponibilidade de B existe e A pede -> NotFoundError", async () => {
    const useCase = new GetDayPlan(
      new FakeScheduledBlockRepository([ON_6TH_EARLY]),
      new FakeWeeklyAvailabilityRepository([makeAvailability(USER_B)]),
    );

    await expect(
      useCase.execute({ userId: USER_A, date: "2025-11-06", timezone: SAO_PAULO }),
    ).rejects.toThrow(NotFoundError);
  });

  test("data fora do formato YYYY-MM-DD -> ValidationException", async () => {
    await expect(
      makeSut([]).execute({ userId: USER_A, date: "06/11/2025", timezone: SAO_PAULO }),
    ).rejects.toThrow(ValidationException);
  });
});
