import { ValidationException } from "@oitenta/shared";
import { GetDayPlan } from "../../../src";
import { FakeScheduledBlockRepository, makeBlock, SAO_PAULO, USER_A, USER_B } from "../../mock";

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

describe("GetDayPlan", () => {
  test("cenario 1: so os blocos de 06/11, em ordem de inicio", async () => {
    const useCase = new GetDayPlan(new FakeScheduledBlockRepository([ON_7TH, ON_6TH_LATE, ON_6TH_EARLY]));

    const output = await useCase.execute({ userId: USER_A, date: "2025-11-06", timezone: SAO_PAULO });

    expect(output.blocks).toEqual([ON_6TH_EARLY, ON_6TH_LATE]);
  });

  test("cenario 2: bloco 23:30-00:30 locais aparece no dia em que comeca (P13)", async () => {
    const crossing = makeBlock({
      start: new Date("2025-11-07T02:30:00.000Z"),
      end: new Date("2025-11-07T03:30:00.000Z"),
    });
    const useCase = new GetDayPlan(new FakeScheduledBlockRepository([crossing]));

    const sixth = await useCase.execute({ userId: USER_A, date: "2025-11-06", timezone: SAO_PAULO });
    const seventh = await useCase.execute({ userId: USER_A, date: "2025-11-07", timezone: SAO_PAULO });

    expect(sixth.blocks).toEqual([crossing]);
    expect(seventh.blocks).toEqual([]);
  });

  test("cenario 4 (posse): blocos de A e B no mesmo dia, A recebe so os dele", async () => {
    const ofB = makeBlock({ userId: USER_B, start: ON_6TH_EARLY.start, end: ON_6TH_EARLY.end });
    const useCase = new GetDayPlan(new FakeScheduledBlockRepository([ON_6TH_EARLY, ofB]));

    const output = await useCase.execute({ userId: USER_A, date: "2025-11-06", timezone: SAO_PAULO });

    expect(output.blocks).toEqual([ON_6TH_EARLY]);
  });

  test("data fora do formato YYYY-MM-DD -> ValidationException", async () => {
    const useCase = new GetDayPlan(new FakeScheduledBlockRepository());

    await expect(
      useCase.execute({ userId: USER_A, date: "06/11/2025", timezone: SAO_PAULO }),
    ).rejects.toThrow(ValidationException);
  });
});
